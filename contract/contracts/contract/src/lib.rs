#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, Address, Env, String,
    Vec,
};

/// Listing status throughout its lifecycle
#[contracttype]
#[derive(Clone)]
pub enum ListingStatus {
    Active,    // Open for purchase
    Sold,      // Buyer has purchased, awaiting delivery confirmation
    Delivered, // Buyer confirmed delivery, transaction complete
    Cancelled, // Seller cancelled before sale
    Disputed,  // Either party raised a dispute
    Refunded,  // Dispute resolved in buyer's favor
}

/// A marketplace listing
#[contracttype]
#[derive(Clone)]
pub struct Listing {
    pub title: String,
    pub description: String,
    pub price: i128,
    pub seller: Address,
    pub buyer: Option<Address>,
    pub status: ListingStatus,
    pub dispute_reason: Option<String>,
}

/// Storage keys
#[contracttype]
pub enum DataKey {
    Counter,       // Auto-incrementing listing ID
    Listings(u64), // Map of listing ID -> Listing
}

/// Contract errors
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,      // Listing doesn't exist
    AlreadySold = 2,   // Listing already purchased
    NotBuyer = 3,      // Only buyer can perform this action
    NotSeller = 4,     // Only seller can perform this action
    NotActive = 5,     // Listing is not in active state
    AlreadyBought = 6, // This buyer already bought this item
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Create a new listing. PERMISSIONLESS - anyone can list items.
    /// Returns the new listing ID.
    pub fn create_listing(
        env: Env,
        seller: Address,
        title: String,
        description: String,
        price: i128,
    ) -> u64 {
        seller.require_auth();

        // Generate new ID
        let id = env
            .storage()
            .instance()
            .get::<_, u64>(&DataKey::Counter)
            .unwrap_or(0)
            + 1;

        let listing = Listing {
            title,
            description,
            price,
            seller,
            buyer: None,
            status: ListingStatus::Active,
            dispute_reason: None,
        };

        env.storage()
            .instance()
            .set(&DataKey::Listings(id), &listing);
        env.storage().instance().set(&DataKey::Counter, &id);

        id
    }

    /// Buy an item. PERMISSIONLESS - anyone can purchase.
    /// The buyer field is set, indicating the sale.
    pub fn buy_item(env: Env, buyer: Address, listing_id: u64) {
        buyer.require_auth();

        let key = DataKey::Listings(listing_id);
        let mut listing: Listing = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        // Validate listing is active
        match listing.status {
            ListingStatus::Active => {}
            ListingStatus::Sold => panic_with_error!(&env, Error::AlreadySold),
            _ => panic_with_error!(&env, Error::NotActive),
        }

        // Check buyer hasn't already bought this
        if listing.buyer.is_some() {
            panic_with_error!(&env, Error::AlreadyBought);
        }

        listing.buyer = Some(buyer);
        listing.status = ListingStatus::Sold;

        env.storage().instance().set(&key, &listing);
    }

    /// Seller cancels their active listing. Only seller can cancel.
    pub fn cancel_listing(env: Env, seller: Address, listing_id: u64) {
        seller.require_auth();

        let key = DataKey::Listings(listing_id);
        let mut listing: Listing = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        // Verify seller owns this listing
        assert_eq!(seller, listing.seller, "only seller can cancel");

        // Can only cancel active listings
        match listing.status {
            ListingStatus::Active => {}
            _ => panic_with_error!(&env, Error::NotActive),
        }

        listing.status = ListingStatus::Cancelled;
        env.storage().instance().set(&key, &listing);
    }

    /// Buyer confirms delivery - transaction is complete.
    /// Only the buyer can confirm.
    pub fn confirm_delivery(env: Env, buyer: Address, listing_id: u64) {
        buyer.require_auth();

        let key = DataKey::Listings(listing_id);
        let listing: Listing = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        // Verify buyer
        let actual_buyer = listing
            .buyer
            .clone()
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotBuyer));
        assert_eq!(buyer, actual_buyer, "only buyer can confirm");

        // Must be in Sold state
        match listing.status {
            ListingStatus::Sold => {}
            _ => panic_with_error!(&env, Error::NotActive),
        }

        let mut listing = listing;
        listing.status = ListingStatus::Delivered;
        env.storage().instance().set(&key, &listing);
    }

    /// Raise a dispute. PERMISSIONLESS - either buyer or seller can dispute.
    pub fn raise_dispute(env: Env, caller: Address, listing_id: u64) {
        caller.require_auth();

        let key = DataKey::Listings(listing_id);
        let mut listing: Listing = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        // Only sold items can be disputed
        match listing.status {
            ListingStatus::Sold => {}
            _ => panic_with_error!(&env, Error::NotActive),
        }

        // Must be buyer or seller
        let is_buyer = listing.buyer.as_ref() == Some(&caller);
        let is_seller = listing.seller == caller;
        assert!(
            is_buyer || is_seller,
            "only buyer or seller can raise dispute"
        );

        listing.status = ListingStatus::Disputed;
        env.storage().instance().set(&key, &listing);
    }

    /// Resolve a dispute. PERMISSIONLESS - can be called by anyone (escrow/mediator pattern).
    /// If buyer_wins is true, buyer gets refunded. Otherwise, funds go to seller.
    pub fn resolve_dispute(env: Env, caller: Address, listing_id: u64, buyer_wins: bool) {
        caller.require_auth();

        let key = DataKey::Listings(listing_id);
        let listing: Listing = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotFound));

        // Must be in disputed state
        match listing.status {
            ListingStatus::Disputed => {}
            _ => panic_with_error!(&env, Error::NotActive),
        }

        let mut listing = listing;
        if buyer_wins {
            listing.status = ListingStatus::Refunded;
        } else {
            listing.status = ListingStatus::Delivered;
        }

        env.storage().instance().set(&key, &listing);
    }

    /// Get a single listing by ID
    pub fn get_listing(env: Env, listing_id: u64) -> Option<Listing> {
        env.storage().instance().get(&DataKey::Listings(listing_id))
    }

    /// Get all active listing IDs
    pub fn get_active_listings(env: Env) -> Vec<u64> {
        let counter: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        let mut ids = Vec::new(&env);
        let mut i: u64 = 1;

        loop {
            if i > counter {
                break;
            }
            if let Some(listing) = env
                .storage()
                .instance()
                .get::<_, Listing>(&DataKey::Listings(i))
            {
                if matches!(listing.status, ListingStatus::Active) {
                    ids.push_back(i);
                }
            }
            i += 1;
        }

        ids
    }

    /// Get all listings by a specific seller
    pub fn get_seller_listings(env: Env, seller: Address) -> Vec<u64> {
        let counter: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        let mut ids = Vec::new(&env);
        let mut i: u64 = 1;

        loop {
            if i > counter {
                break;
            }
            if let Some(listing) = env
                .storage()
                .instance()
                .get::<_, Listing>(&DataKey::Listings(i))
            {
                if listing.seller == seller {
                    ids.push_back(i);
                }
            }
            i += 1;
        }

        ids
    }

    /// Get all listings purchased by a specific buyer
    pub fn get_buyer_listings(env: Env, buyer: Address) -> Vec<u64> {
        let counter: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        let mut ids = Vec::new(&env);
        let mut i: u64 = 1;

        loop {
            if i > counter {
                break;
            }
            if let Some(listing) = env
                .storage()
                .instance()
                .get::<_, Listing>(&DataKey::Listings(i))
            {
                if listing.buyer.as_ref() == Some(&buyer) {
                    ids.push_back(i);
                }
            }
            i += 1;
        }

        ids
    }
}

mod test;
