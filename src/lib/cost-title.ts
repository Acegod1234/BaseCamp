/** Short headings for package cost bullets; descriptions remain unchanged. */
export function costTitle(description: string): string {
  const text = description.replace(/^\d+\.\s*/, "").trim();
  const prefix = text.match(/^([^:]{3,50}):\s/);
  if (prefix) return prefix[1];

  const rules: [RegExp, string][] = [
    [/high altitude food/i, "High altitude food"],
    [/separate from the main group/i, "Separate travel expenses"],
    [/^Gokyo Cho la Pass Everest Base Camp Trek/i, "Trekking route"],
    [/welcome or farewell dinner/i, "Welcome or farewell dinner"],
    [/dinning tent|dining tent/i, "Dining tent"],
    [/gas.*burner/i, "Cooking fuel and burner"],
    [/excess baggage/i, "Excess baggage charges"],
    [/baggage storage/i, "Baggage storage"],
    [/international.*(flight|airfare|ticket)|visa.*international/i, "International travel"],
    [/visa/i, "Visa fees"],
    [/unforeseen|delays|cancellation|natural calamities|beyond management/i, "Unexpected additional costs"],
    [/insurance.*(guide|sherpa|crew)|^(staff.*insurance|insurance of)/i, "Staff insurance"],
    [/insurance.*(medical|rescue|evacuation)|travel insurance.*medical/i, "Insurance and emergency expenses"],
    [/insurance/i, "Insurance coverage"],
    [/medical treatment|rescue|evacuation/i, "Emergency medical support"],
    [/first.?aid|medical kit|medical supplies/i, "First aid and medical kit"],
    [/ox[yi]meter/i, "Oxygen level monitoring"],
    [/oxygen|altitude chamber/i, "Oxygen and altitude support"],
    [/staff.*(food|meal|salary|support|equipment)|crew.*(support|wages)|support.*crew|food.*salary|expenses.*guide|staff.*allowances/i, "Trekking crew support"],
    [/tips|tipping|gratuities/i, "Tips and gratuities"],
    [/porter|yaks|yak men/i, "Porter and luggage services"],
    [/pony/i, "Pony services"],
    [/helicopter.*(flight|fare|return)|flight.*helicopter/i, "Helicopter flights"],
    [/flight|airfare|air ticket/i, "Flight tickets"],
    [/airport.*(transfer|pick|drop|transport)|pick.*airport|airport\/htl|airport\s*\/\s*hotel/i, "Airport transfers"],
    [/airport tax/i, "Airport taxes"],
    [/personal.*(gear|equipment|equipments|clothes)|climbing.*(gear|equipment)|^equipments/i, "Personal trekking and climbing gear"],
    [/laundry|personal expense|personal expenditure|personal nature/i, "Personal expenses"],
    [/hotel.*meal|accommodation.*meal|meal.*accommodation/i, "Accommodation and meals"],
    [/guesthouse|guest house|teahouse|tea house|lodges/i, "Guesthouse accommodation"],
    [/camp.*accommodation|all camps|tented camp/i, "Camping accommodation"],
    [/hotel|accommodation/i, "Hotel accommodation"],
    [/lunch.*dinner|meals.*kathmandu|meals.*kahtmandu/i, "Meals"],
    [/meal|breakfast|lunch|full board|food.*(tour|river)/i, "Meals and refreshments"],
    [/drink|beverage|tea|coffee|bar bills|bottled.*water/i, "Drinks and refreshments"],
    [/boiled.*water/i, "Drinking water"],
    [/permit|entry fee|entrance fee/i, "Permits and entry fees"],
    [/government tax|vat|tourist tax|official exp|fuel surcharge/i, "Taxes and fees"],
    [/map/i, "Route map"],
    [/assistant guide/i, "Assistant guide"],
    [/guide|trek leader/i, "Professional guide"],
    [/cook/i, "Experienced cook"],
    [/safety kayaker/i, "Safety kayakers"],
    [/sherpa crew/i, "Sherpa crew"],
    [/sleeping bag|down jacket|trekking equipment|walking stick/i, "Trekking equipment"],
    [/camping equipment|tents|mattress/i, "Camping equipment"],
    [/rafting equipment/i, "Rafting equipment"],
    [/transport|transfer|jeep|vehicle|land cruiser|truck/i, "Ground transportation"],
    [/sightseeing|sight seeing|tour activities|excursions/i, "Sightseeing and activities"],
    [/satellite phone/i, "Satellite phone"],
    [/walkie.talkie/i, "Radio communications"],
    [/solar|generator/i, "Power supply"],
    [/mask.*regulator/i, "Oxygen mask and regulator"],
    [/certificate/i, "Trek completion certificate"],
    [/hot spring/i, "Hot spring visit"],
    [/electronic/i, "Electronic equipment"],
    [/other|not mentioned|not specifically/i, "Other services and expenses"],
  ];
  for (const [pattern, title] of rules) {
    if (pattern.test(text)) return title;
  }
  const words = text.replace(/[.!]+$/, "").split(/\s+/);
  const title = words.slice(0, 7).join(" ");
  return title.charAt(0).toUpperCase() + title.slice(1);
}
