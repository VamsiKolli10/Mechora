import { addressForm, addressPayload } from "../addresses";

it("submits editable address data without metadata and explicitly clears optional values", () => {
  const payload = addressPayload({ id: 12, user_id: 3, name: "Buyer", street: "1 Main", city: "City", state: "CA", zip: "94105", country: "US", type: "both", phone: "", label: null, created_at: "yesterday", updated_at: "today" });
  const wire = JSON.parse(JSON.stringify(payload));
  expect(wire).toMatchObject({ name: "Buyer", type: "both", phone: null, label: null });
  for (const key of ["id", "user_id", "created_at", "updated_at"]) expect(wire).not.toHaveProperty(key);
});
it("normalizes legacy country codes and null optional fields for editing", () => {
  expect(addressForm({ country: "UK", phone: null, label: null })).toMatchObject({ country: "GB", phone: "", label: "" });
});
