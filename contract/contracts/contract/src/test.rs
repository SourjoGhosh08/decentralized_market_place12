#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

// ===== PERMISSIONLESS LISTING TESTS =====

#[test]
fn test_anyone_can_list_item() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Any address can list - no admin needed
    let seller1 = Address::generate(&env);
    let seller2 = Address::generate(&env);

    let id1 = client.create_listing(
        &seller1,
        &String::from_str(&env, "Vintage Watch"),
        &String::from_str(&env, "Beautiful 1970s mechanical watch"),
        &1000_i128,
    );

    let id2 = client.create_listing(
        &seller2,
        &String::from_str(&env, "Gaming Console"),
        &String::from_str(&env, "Next-gen gaming system"),
        &500_i128,
    );

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);

    // Both listings exist and belong to different sellers
    let listing1 = client.get_listing(&id1).unwrap();
    let listing2 = client.get_listing(&id2).unwrap();
    assert_eq!(listing1.seller, seller1);
    assert_eq!(listing2.seller, seller2);
}

#[test]
fn test_listing_properties() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "iPhone 15"),
        &String::from_str(&env, "Brand new, sealed"),
        &999_i128,
    );

    let listing = client.get_listing(&id).unwrap();
    assert_eq!(listing.title, String::from_str(&env, "iPhone 15"));
    assert_eq!(
        listing.description,
        String::from_str(&env, "Brand new, sealed")
    );
    assert_eq!(listing.price, 999_i128);
    assert_eq!(listing.seller, seller);
    assert!(listing.buyer.is_none());
    assert!(matches!(listing.status, ListingStatus::Active));
}

// ===== PERMISSIONLESS BUYING TESTS =====

#[test]
fn test_anyone_can_buy() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    // Create a listing
    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Camera"),
        &String::from_str(&env, "Canon DSLR"),
        &800_i128,
    );

    // Anyone can buy - no permissions needed
    client.buy_item(&buyer, &id);

    let listing = client.get_listing(&id).unwrap();
    assert!(listing.buyer.is_some());
    assert_eq!(listing.buyer.unwrap(), buyer);
    assert!(matches!(listing.status, ListingStatus::Sold));
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_cannot_buy_already_sold() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer1 = Address::generate(&env);
    let buyer2 = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );

    // First buyer succeeds
    client.buy_item(&buyer1, &id);

    // Second buyer fails
    client.buy_item(&buyer2, &id);
}

// ===== SELLER CANCEL TESTS =====

#[test]
fn test_seller_can_cancel_active_listing() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Bike"),
        &String::from_str(&env, "Mountain bike"),
        &300_i128,
    );

    client.cancel_listing(&seller, &id);

    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Cancelled));
}

#[test]
#[should_panic(expected = "only seller can cancel")]
fn test_only_seller_can_cancel() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let other = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );

    // Other person tries to cancel - should fail
    client.cancel_listing(&other, &id);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5)")]
fn test_cannot_cancel_sold_listing() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );

    client.buy_item(&buyer, &id);
    client.cancel_listing(&seller, &id); // Should fail - already sold
}

// ===== CONFIRM DELIVERY TESTS =====

#[test]
fn test_buyer_can_confirm_delivery() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Laptop"),
        &String::from_str(&env, "MacBook Pro"),
        &1500_i128,
    );

    client.buy_item(&buyer, &id);
    client.confirm_delivery(&buyer, &id);

    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Delivered));
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_cannot_confirm_before_buying() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );

    // Buyer tries to confirm without buying - should fail
    client.confirm_delivery(&buyer, &id);
}

// ===== DISPUTE TESTS =====

#[test]
fn test_buyer_can_raise_dispute() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );

    client.buy_item(&buyer, &id);
    client.raise_dispute(&buyer, &id);

    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Disputed));
}

#[test]
fn test_seller_can_raise_dispute() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );

    client.buy_item(&buyer, &id);
    client.raise_dispute(&seller, &id);

    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Disputed));
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5)")]
fn test_cannot_dispute_active_listing() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );

    // Dispute before buying - should fail
    client.raise_dispute(&buyer, &id);
}

#[test]
fn test_resolve_dispute_refunds_buyer() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );

    client.buy_item(&buyer, &id);
    client.raise_dispute(&buyer, &id);

    // Resolved in favor of buyer (buyer_wins = true)
    client.resolve_dispute(&buyer, &id, &true);

    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Refunded));
}

#[test]
fn test_resolve_dispute_releases_to_seller() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );

    client.buy_item(&buyer, &id);
    client.raise_dispute(&seller, &id);

    // Resolved in favor of seller (buyer_wins = false)
    client.resolve_dispute(&seller, &id, &false);

    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Delivered));
}

// ===== VIEW FUNCTIONS TESTS =====

#[test]
fn test_get_active_listings() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    let id1 = client.create_listing(
        &seller,
        &String::from_str(&env, "Item 1"),
        &String::from_str(&env, "Desc 1"),
        &100_i128,
    );
    let _id2 = client.create_listing(
        &seller,
        &String::from_str(&env, "Item 2"),
        &String::from_str(&env, "Desc 2"),
        &200_i128,
    );
    let _id3 = client.create_listing(
        &seller,
        &String::from_str(&env, "Item 3"),
        &String::from_str(&env, "Desc 3"),
        &300_i128,
    );

    // Buy one
    client.buy_item(&buyer, &id1);

    // Cancel another
    client.cancel_listing(&seller, &_id2);

    // Only id3 should be active
    let active = client.get_active_listings();
    assert_eq!(active.len(), 1);
    assert_eq!(active.get(0).unwrap(), id1 + 2); // id3
}

#[test]
fn test_get_seller_listings() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller1 = Address::generate(&env);
    let seller2 = Address::generate(&env);

    // Seller 1 creates 2 listings
    client.create_listing(
        &seller1,
        &String::from_str(&env, "Item 1"),
        &String::from_str(&env, "Desc 1"),
        &100_i128,
    );
    let id2 = client.create_listing(
        &seller1,
        &String::from_str(&env, "Item 2"),
        &String::from_str(&env, "Desc 2"),
        &200_i128,
    );

    // Seller 2 creates 1 listing
    client.create_listing(
        &seller2,
        &String::from_str(&env, "Item 3"),
        &String::from_str(&env, "Desc 3"),
        &300_i128,
    );

    let seller1_listings = client.get_seller_listings(&seller1);
    assert_eq!(seller1_listings.len(), 2);
    assert!(seller1_listings.contains(&id2));
}

#[test]
fn test_get_buyer_listings() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer1 = Address::generate(&env);
    let buyer2 = Address::generate(&env);

    let id1 = client.create_listing(
        &seller,
        &String::from_str(&env, "Item 1"),
        &String::from_str(&env, "Desc 1"),
        &100_i128,
    );
    let id2 = client.create_listing(
        &seller,
        &String::from_str(&env, "Item 2"),
        &String::from_str(&env, "Desc 2"),
        &200_i128,
    );
    let _id3 = client.create_listing(
        &seller,
        &String::from_str(&env, "Item 3"),
        &String::from_str(&env, "Desc 3"),
        &300_i128,
    );

    client.buy_item(&buyer1, &id1);
    client.buy_item(&buyer2, &id2);

    let buyer1_purchases = client.get_buyer_listings(&buyer1);
    assert_eq!(buyer1_purchases.len(), 1);
    assert_eq!(buyer1_purchases.get(0).unwrap(), id1);
}

// ===== FULL FLOW TESTS =====

#[test]
fn test_full_happy_path() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    // 1. Seller lists item
    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Vintage Guitar"),
        &String::from_str(&env, "1960s Fender Stratocaster"),
        &5000_i128,
    );

    // Verify active
    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Active));

    // 2. Buyer purchases
    client.buy_item(&buyer, &id);
    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Sold));

    // 3. Buyer confirms delivery
    client.confirm_delivery(&buyer, &id);
    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Delivered));

    // 4. Item no longer in active listings
    let active = client.get_active_listings();
    assert!(!active.contains(&id));
}

#[test]
fn test_dispute_flow() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    // 1. List and buy
    let id = client.create_listing(
        &seller,
        &String::from_str(&env, "Expensive Item"),
        &String::from_str(&env, "High value product"),
        &10000_i128,
    );
    client.buy_item(&buyer, &id);

    // 2. Buyer raises dispute (item not as described)
    client.raise_dispute(&buyer, &id);
    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Disputed));

    // 3. Either party resolves (mediator decides)
    client.resolve_dispute(&buyer, &id, &true);

    // 4. Final state - refunded
    let listing = client.get_listing(&id).unwrap();
    assert!(matches!(listing.status, ListingStatus::Refunded));
}

// ===== EDGE CASES =====

#[test]
fn test_multiple_sellers_independent() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let seller1 = Address::generate(&env);
    let seller2 = Address::generate(&env);

    let id1 = client.create_listing(
        &seller1,
        &String::from_str(&env, "Seller1 Item"),
        &String::from_str(&env, "Desc"),
        &100_i128,
    );
    let id2 = client.create_listing(
        &seller2,
        &String::from_str(&env, "Seller2 Item"),
        &String::from_str(&env, "Desc"),
        &200_i128,
    );

    // Each seller can only cancel their own
    client.cancel_listing(&seller1, &id1);
    client.cancel_listing(&seller2, &id2); // This should now work since it's seller2's item

    // Verify correct cancellations
    assert!(matches!(
        client.get_listing(&id1).unwrap().status,
        ListingStatus::Cancelled
    ));
}

#[test]
fn test_get_nonexistent_listing() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    // Should return None, not panic
    let result = client.get_listing(&99999);
    assert!(result.is_none());
}
