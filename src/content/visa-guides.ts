export type VisaGuide = {
  country: string;
  photo: string;
  intro: string;
  stay: string;
  timing: string;
  fees: { item: string; cost: string; note: string }[];
  feeNote: string;
  documents: string[];
  steps: string[];
  apply: { name: string; url: string; detail: string }[];
  notes: string[];
  sources: { name: string; url: string }[];
};

export const visaGuides: Record<string, VisaGuide> = {
  nepal: {
    country: "Nepal", photo: "/photos/activity-tour.webp",
    intro: "Most tourists can obtain a multiple-entry tourist visa on arrival. Eligibility depends on nationality and travel document; check this before departure. Indian nationals do not need a tourist visa.",
    stay: "15, 30 or 90 days", timing: "At entry for eligible arrivals; embassy processing varies",
    fees: [
      { item: "15-day tourist visa", cost: "US$30", note: "Multiple entry" },
      { item: "30-day tourist visa", cost: "US$50", note: "Multiple entry" },
      { item: "90-day tourist visa", cost: "US$125", note: "Multiple entry" },
      { item: "Tourist visa extension", cost: "US$45 minimum", note: "First 15 days, then US$3 per additional day" },
    ],
    feeNote: "Some nationalities and traveller categories qualify for a free visa. Check Immigration’s current eligibility before paying. An online application alone does not grant entry.",
    documents: ["Valid original passport and a clear copy of its identity page.", "Recent passport-size photograph with a light background.", "Completed tourist visa application and any online confirmation or receipt.", "Nepal accommodation address, arrival details and payment for the applicable fee."],
    steps: ["Check visa-on-arrival eligibility with Nepal Immigration; travellers who are ineligible must use a Nepalese diplomatic mission before travel.", "Complete the official online tourist application or the entry-point procedure. Select the stay length and enter your accommodation details.", "Pay the appropriate fee and keep the receipt. Bring a suitable payment method; entry-point arrangements can vary.", "Present the passport, application and receipt to immigration. Check the issued visa and permitted stay before leaving the counter.", "For an extension, apply through the Department of Immigration in Kathmandu or Pokhara before the current visa expires."],
    apply: [
      { name: "Nepal Immigration online services", url: "https://nepaliport.immigration.gov.np/", detail: "Official tourist application services; follow the current entry-point instructions." },
      { name: "Nepal Department of Immigration", url: "https://immigration.gov.np/visa-information", detail: "Eligibility, extensions and instructions for applications through diplomatic missions." },
    ],
    notes: ["On-arrival service is available at Kathmandu, Pokhara and Gautam Buddha international airports and designated land entry points.", "Some passport holders and refugees travelling with travel documents must obtain a visa before arrival; consult the current official exclusion list.", "A visa issued by a Nepalese mission must generally be used to enter within six months of issue. The authorised stay starts on entry.", "Extensions are subject to immigration approval. Check the current yearly stay limit and any overstay charges directly with Immigration."],
    sources: [
      { name: "Nepal Tourism Board: tourist visas", url: "https://ntb.gov.np/en/plan-your-trip/before-you-come/tourist-visa" },
      { name: "Department of Immigration: visa fees and documents", url: "https://immigration.gov.np/visa-fees-and-documents" },
      { name: "Department of Immigration: visa information", url: "https://immigration.gov.np/visa-information" },
    ],
  },
  tibet: {
    country: "Tibet", photo: "/photos/region-tibet.webp",
    intro: "Tibet travel involves two separate checks: lawful entry to China and a Tibet travel permit. A Chinese visa or visa-free entry entitlement alone does not authorise travel in the Tibet Autonomous Region.",
    stay: "Your China entry allowance and approved Tibet itinerary", timing: "Confirm both visa and permit processing before booking",
    fees: [
      { item: "Chinese visa", cost: "Nationality-dependent", note: "Also depends on visa category, entries and application location" },
      { item: "Kathmandu regular service fee", cost: "NPR 3,900", note: "Listed in the centre’s currently linked schedule; separate from the embassy fee" },
      { item: "US standard visa example", cost: "NPR 23,000 total", note: "NPR 19,100 embassy fee + NPR 3,900 regular service fee" },
      { item: "Canadian standard visa example", cost: "NPR 11,500 total", note: "NPR 7,600 embassy fee + NPR 3,900 regular service fee" },
      { item: "Tibet permit arrangements", cost: "Confirm with your operator", note: "Ask for an itemised itinerary quotation, including any additional permits" },
    ],
    feeNote: "The examples are ordinary Chinese visa tariffs from the schedule currently linked by the Kathmandu centre, not a universal Tibet group-visa price. Group and expedited fees differ. Confirm the applicable current tariff before payment; Kathmandu payments are in Nepalese rupees.",
    documents: ["Original passport with more than six months’ validity, blank visa pages and an identity-page copy for a Chinese visa application.", "Online visa form, matching digital and paper photographs, and proof of lawful stay if applying outside your country of citizenship.", "Travel itinerary, return-flight and hotel records, or a qualifying invitation letter. A Group L application requires an invitation from an authorised tourism unit.", "For Tibet permit arrangements, have passport and China entry documentation available for your specialist operator; confirm its itinerary-specific checklist before submitting."],
    steps: ["Choose a specialist Tibet operator and agree the route and dates. The Tibet permit must be arranged through a specialist travel agent in China.", "Confirm the China entry procedure for your nationality and route. If entering from Nepal, ask the operator and Kathmandu visa centre which individual or group process applies before applying.", "For a Kathmandu Chinese visa, complete the centre’s online form and upload documents. Wait for the instruction to submit your passport.", "Submit the passport and supporting documents as instructed, pay the applicable fees, and collect the approved visa. Attend in person or use representation only where the centre permits it.", "Have the operator confirm permit approval, how to receive the permit, and which documents to present for the journey. Travel only within the approved dates and route."],
    apply: [
      { name: "Kathmandu Chinese Visa Application Service Center", url: "https://visaforchina.cn/KTM4_EN/", detail: "China visa applications and current submission instructions for applicants in Nepal." },
      { name: "Chinese Embassy in Nepal", url: "https://np.china-embassy.gov.cn/eng/ConsularServices/cv/", detail: "Official visa-policy notices. The Tibet travel permit is arranged separately through your specialist operator." },
    ],
    notes: ["There is no single 15-, 30- or 90-day Tibet visa tariff. China entry conditions and the permit’s approved itinerary both govern your travel.", "Visa validity, permitted entries and duration of stay are different conditions; read the issued document carefully.", "Allow enough lead time for both approvals. Processing and access restrictions can change, and additional documents may be requested.", "Visa-free China entry, where available, does not remove the Tibet permit requirement. Confirm eligibility with the Chinese authorities for your passport and route."],
    sources: [
      { name: "UK government: Tibet permit requirements", url: "https://www.gov.uk/foreign-travel-advice/china/regional-risks" },
      { name: "Kathmandu centre: ordinary visa procedure", url: "https://visaforchina.cn/KTM4_EN/tongzhigonggao/558222278345756672.html" },
      { name: "Kathmandu centre: fees and payment", url: "https://bio.visaforchina.cn/KTM4_EN/qianzhengyewu/jichuzhishi/feiyongbiaozhunjishixian" },
      { name: "Centre-linked fee schedule (PDF)", url: "https://bio.visaforchina.cn/KTM3_EN/upload/20240430/0c0efdff744546eba3c03984bcfb5db2.pdf" },
    ],
  },
  bhutan: {
    country: "Bhutan", photo: "/photos/region-bhutan.webp",
    intro: "Most international tourists need visa approval before travelling. Indian nationals use an entry permit; Bangladesh and Maldives passport holders have a separate process. Visa fees and the Sustainable Development Fee (SDF) are separate charges.",
    stay: "Approved travel dates; maximum 90 days from entry", timing: "Allow at least five working days for processing",
    fees: [
      { item: "Standard visa application", cost: "US$40", note: "One-time, non-refundable processing fee; nationality exceptions apply" },
      { item: "Standard adult SDF", cost: "US$100 per night", note: "Separate from accommodation, transport, guides and other travel costs" },
      { item: "SDF: ages 6–11", cost: "US$50 per night", note: "Children who have not turned 12" },
      { item: "SDF: children under 6", cost: "No SDF", note: "The child’s other travel costs remain separate" },
      { item: "Indian national SDF", cost: "Nu./INR 1,200 per night", note: "Ages 6–11: Nu./INR 600; under 6: no SDF" },
    ],
    feeNote: "For illustration, a standard adult staying five nights pays US$500 SDF plus the US$40 visa fee: US$540 before trip costs. Use the official portal to confirm nationality-specific charges and concessions.",
    documents: ["Digital passport identity-page copy. The passport must remain valid for at least six months after your intended departure from Bhutan.", "Recent digital passport-size photograph.", "Arrival and departure dates, travel details and a payment method for the applicable charges.", "Indian applicants: accepted passport or voter ID; a birth certificate may be required for children. Immigration may request additional documents."],
    steps: ["Use Bhutan’s official immigration portal yourself, or have a certified tour operator or hotel apply on your behalf.", "Create an account, complete the Pledge of Friendship and enter each traveller’s details and planned dates.", "Upload the required documents and pay the applicable visa fee and SDF for the planned stay.", "Submit the application and allow at least five working days for review; respond to any requests for further information.", "Keep the approval available for travel and check that it matches your passport and dates. Arrange changes or extensions through Immigration before your approval expires."],
    apply: [
      { name: "Bhutan Immigration visa / permit portal", url: "https://immi.gov.bt/", detail: "Official online applications, including those submitted by your tour operator or hotel." },
      { name: "Bhutan Travel visa guide", url: "https://bhutan.travel/visa", detail: "Application instructions and separate arrangements for India, Bangladesh and Maldives." },
    ],
    notes: ["Indian visitors require a permit rather than a tourist visa. Bangladesh and Maldives visitors require visas but may apply in advance or at entry; advance arrangements are recommended.", "The published maximum stay is 90 days from entry; your approved dates and paid SDF must cover the actual visit.", "Travel insurance is recommended. Bhutan has withdrawn its mandatory insurance requirement for visa processing.", "A visa approval is not a travel package: budget separately for hotels, guiding, transport, meals and attractions."],
    sources: [
      { name: "Bhutan Travel: visa application", url: "https://bhutan.travel/visa" },
      { name: "Bhutan Travel: stay limits, SDF and nationality rules", url: "https://bhutan.travel/faqs" },
      { name: "Bhutan Immigration: tourist document requirements", url: "https://www.doi.gov.bt/?page_id=1334&lang=en" },
      { name: "Bhutan Travel: insurance policy update", url: "https://bhutan.travel/announcements" },
    ],
  },
};
