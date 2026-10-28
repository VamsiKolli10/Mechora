const fields = ["type", "label", "name", "street", "street2", "city", "state", "zip", "country", "phone"];

export const addressForm = (address = {}) => ({
  ...Object.fromEntries(fields.map(field => [field, address[field] ?? ""])),
  type: address.type || "shipping",
  country: address.country === "UK" ? "GB" : address.country || "US",
  is_default: Boolean(address.is_default),
});

export const addressPayload = (address) => {
  const form = addressForm(address);
  return {
    ...form,
    label: form.label.trim() || null,
    phone: form.phone.trim() || null,
  };
};
