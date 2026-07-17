from app.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_hash_round_trip():
    hashed = hash_password("Admin123!")
    assert verify_password("Admin123!", hashed)
    assert not verify_password("wrong", hashed)


def test_token_round_trip():
    token = create_access_token({"sub": "00000000-0000-0000-0000-000000000000"})
    assert decode_access_token(token)["sub"] == "00000000-0000-0000-0000-000000000000"

