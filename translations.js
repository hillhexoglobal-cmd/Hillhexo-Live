// Hillhexo Multilingual Translation System (EN, NL, DE)
const translations = {
    "en": {
        // Navigation
        "nav_home": "Home",
        "nav_services": "Services",
        "nav_contact": "Contact",

        // Footer
        "footer_watermark": "HILLHEXO",
        "footer_subscribe_text": "Subscribe to receive our latest updates and insights.",
        "footer_subscribe_placeholder": "Enter your email address",
        "footer_quick_links": "Quick Links",
        "footer_newsletter": "Newsletter",
        "footer_copyright": "© 2026 HILLHEXO LTD. All rights reserved.",

        // Contact Page
        "contact_banner_badge": "GET IN TOUCH",
        "contact_banner_title": "CONNECT WITH <span class=\"gold-text\">US</span>",
        "contact_banner_desc": "Have a project, inquiry, or partnership opportunity? Reach out to our global team and let's structure your supply chain for scale.",
        "contact_email_title": "Email Us",
        "contact_hours_title": "Business Hours",
        "contact_hours_desc": "Monday - Friday: 9am - 6pm",
        "contact_label_name": "Name",
        "contact_label_email": "Email",
        "contact_label_phone": "Phone Number",
        "contact_label_company": "Company Name",
        "contact_label_priority": "Priority Status",
        "contact_option_priority_default": "Select priority",
        "contact_option_priority_low": "Low",
        "contact_option_priority_medium": "Medium",
        "contact_option_priority_urgent": "Urgent",
        "contact_label_subject": "Subject",
        "contact_label_message": "Message",
        "contact_placeholder_name": "John Doe",
        "contact_placeholder_email": "john@example.com",
        "contact_placeholder_phone": "+44 7553 599805",
        "contact_placeholder_company": "Acme Corporation",
        "contact_placeholder_subject": "Partnership Opportunity",
        "contact_placeholder_message": "How can we help your business?",
        "contact_btn_submit": "Send Message",
        "contact_modal_message_label": "Message Enquiry Box",
        "contact_modal_message_placeholder": "Describe your shipment details or inquiries...",
        "contact_modal_submit_btn": "Send Enquiry",

        // Services Page
        "services_banner_badge": "CORE CAPABILITIES",
        "services_banner_title": "OUR <span class=\"gold-text\">SERVICES</span>",
        "services_banner_desc": "We deploy global reach paired with deep, specialized industry vertical expertise, providing end-to-end support, inside dealer brokerage, and direct dealer brand ownership.",
        "services_section1_badge": "WHAT WE DO",
        "services_section1_title": "Core Business Models",
        "services_section1_desc": "We operate through three distinct, powerful models to maximize global trade potential.",
        "services_card1_title": "Support Services",
        "services_card1_desc": "Export/Import Assistance for registered companies and individual traders.",
        "services_card1_bullet1": "End-to-end logistics & customs",
        "services_card1_bullet2": "Supplier/buyer coordination",
        "services_card1_bullet3": "UK/EU/IND compliance",
        "services_card1_bullet4": "Warehousing & distribution",
        "services_card2_title": "Inside Dealer",
        "services_card2_desc": "Market-based Third-Party Trading connecting global suppliers with active buyers.",
        "services_card2_bullet1": "Global market research",
        "services_card2_bullet2": "Product sourcing & validation",
        "services_card2_bullet3": "Deal structuring & negotiation",
        "services_card2_bullet4": "Import/export management",
        "services_card3_title": "Direct Dealer",
        "services_card3_desc": "Brand Ownership and Market Creation for high-potential, niche products.",
        "services_card3_bullet1": "Select high-potential products",
        "services_card3_bullet2": "Private-label & rebranding",
        "services_card3_bullet3": "Market presence in UK/EU/IND",
        "services_card3_bullet4": "Full supply chain ownership",
        "services_section2_badge": "OUR PROCESS",
        "services_section2_title": "Operational Workflow",
        "services_section2_desc": "Our robust 8-step working protocol guarantees efficiency, quality, and market readiness from concept to distribution.",
        "services_step1_title": "Identification",
        "services_step1_desc": "Research trends, find high-demand gaps, and evaluate scalability.",
        "services_step2_title": "Verification",
        "services_step2_desc": "Validate supplier credibility, capacity, and strict quality standards.",
        "services_step3_title": "Market Validation",
        "services_step3_desc": "Identify target buyers, conduct demand testing, and analyze competition.",
        "services_step4_title": "Model Decision",
        "services_step4_desc": "Select the best path: Support Service, Inside Dealer, or Direct Dealer.",
        "services_step5_title": "Deal Structuring",
        "services_step5_desc": "Finalize pricing strategy, contracts, agreements, and payment terms.",
        "services_step6_title": "Logistics Execution",
        "services_step6_desc": "Arrange shipping, customs clearance, and delivery to warehouse.",
        "services_step7_title": "Sales & Distribution",
        "services_step7_desc": "Deliver directly to buyers, expand market reach, and scale volumes.",
        "services_step8_title": "Brand Development",
        "services_step8_desc": "(Direct Dealer) Create identity, packaging, and marketing campaigns.",

        // Homepage
        "hero_title": "Smart Logistics Solutions<br>for Modern Businesses",
        "hero_desc": '"Deliver. Optimize. Grow." Our logistics solutions help businesses streamline operations, improve efficiency, and enhance customer experiences. From supply chain management to transportation coordination, we provide the tools and support needed to keep your business moving forward in a fast-changing world.',
        "hero_btn_explore": "Explore More",
        "marquee_chain": "Global Supply Chain",
        "marquee_forwarding": "Freight Forwarding",
        "marquee_delivering": "Delivering Excellence",
        "marquee_dist": "Strategic Distribution",
        "marquee_cargo": "Ocean & Air Cargo",
        "marquee_nextgen": "Next-Gen Logistics",
        "about_badge": "WHO WE ARE",
        "about_title": "Mission <span class=\"gold-text\">&</span> Vision",
        "about_subtitle": "Transforming global trade by making high-potential products accessible, scalable, and successful across borders.",
        "about_vision_title": "Our Vision",
        "about_vision_desc": "To become a leading global trade enabler and product development powerhouse connecting emerging products with high-demand markets.",
        "about_concept_title": "The Concept",
        "about_concept_desc": "HILLHEXO LTD acts as a bridge between product origin and market demand. We identify products with strong potential, facilitate logistics, build supply chains, and create or expand markets.",
        "comp_badge": "WHY CHOOSE US",
        "comp_title": "Our Competitive Advantage",
        "comp_card1_title": "Hybrid Model",
        "comp_card1_desc": "A unique combination of logistics support, smart trading, and direct brand creation under one roof.",
        "comp_card2_title": "Market Intelligence",
        "comp_card2_desc": "Data-driven product selection ensures we only scale products with high demand and low supply gaps.",
        "comp_card3_title": "Flexibility",
        "comp_card3_desc": "We successfully adapt our models to work with both emerging, small suppliers and large-scale enterprises.",
        "comp_card4_title": "End-to-end Control",
        "comp_card4_desc": "From initial sourcing to final market delivery, we manage the full supply chain to guarantee success.",
        "market_badge": "GLOBAL REACH",
        "market_title": "Market Opportunity",
        "market_desc": "Global supply is increasing, but market access remains fragmented. We leverage government-free trade deals to bring better opportunities to the global market, solving failures caused by poor logistics, weak branding, or entry strategy.",
        "market_card1_title": "Target Markets",
        "market_card1_desc": "We focus on the UK, European Union, and India, while actively exploring emerging markets across Asia, Africa, and South America.",
        "market_card2_title": "Industries in Focus",
        "market_card2_desc": "Consumer goods, agriculture products, industrial materials, sustainable products, tech accessories, and fashion."
    },
    "nl": {
        // Navigation
        "nav_home": "Home",
        "nav_services": "Diensten",
        "nav_contact": "Contact",

        // Footer
        "footer_watermark": "HILLHEXO",
        "footer_subscribe_text": "Abonneer u om onze nieuwste updates en inzichten te ontvangen.",
        "footer_subscribe_placeholder": "Vul uw e-mailadres in",
        "footer_quick_links": "Snelle Links",
        "footer_newsletter": "Nieuwsbrief",
        "footer_copyright": "© 2026 HILLHEXO LTD. Alle rechten voorbehouden.",

        // Contact Page
        "contact_banner_badge": "NEEM CONTACT OP",
        "contact_banner_title": "NEEM CONTACT MET <span class=\"gold-text\">ONS</span> OP",
        "contact_banner_desc": "Heeft u een project, vraag of samenwerkingsmogelijkheid? Neem contact op met ons wereldwijde team en laat ons uw toeleveringsketen structureren voor groei.",
        "contact_email_title": "E-mail Ons",
        "contact_hours_title": "Kantooruren",
        "contact_hours_desc": "Maandag - Vrijdag: 09:00 - 18:00 uur",
        "contact_label_name": "Naam",
        "contact_label_email": "E-mailadres",
        "contact_label_phone": "Telefoonnummer",
        "contact_label_company": "Bedrijfsnaam",
        "contact_label_priority": "Prioriteitsstatus",
        "contact_option_priority_default": "Selecteer prioriteit",
        "contact_option_priority_low": "Laag",
        "contact_option_priority_medium": "Gemiddeld",
        "contact_option_priority_urgent": "Dringend",
        "contact_label_subject": "Onderwerp",
        "contact_label_message": "Bericht",
        "contact_placeholder_name": "Jan Jansen",
        "contact_placeholder_email": "jan@voorbeeld.nl",
        "contact_placeholder_phone": "+44 7553 599805",
        "contact_placeholder_company": "Acme Bedrijf",
        "contact_placeholder_subject": "Samenwerkingsmogelijkheid",
        "contact_placeholder_message": "Hoe kunnen we uw bedrijf helpen?",
        "contact_btn_submit": "Bericht Verzenden",
        "contact_modal_message_label": "Bericht en enquête box",
        "contact_modal_message_placeholder": "Beschrijf uw zendingdetails of vragen...",
        "contact_modal_submit_btn": "Aanvraag Verzenden",

        // Services Page
        "services_banner_badge": "KERNCOMPETENTIES",
        "services_banner_title": "ONZE <span class=\"gold-text\">DIENSTEN</span>",
        "services_banner_desc": "Wij bieden wereldwijd bereik in combinatie met diepe, gespecialiseerde expertise in verticale sectoren, en bieden end-to-end ondersteuning, inside-dealer makelaardij en directe merkidentiteit als direct dealer.",
        "services_section1_badge": "WAT WE DOEN",
        "services_section1_title": "Kernbedrijfsmodellen",
        "services_section1_desc": "We werken via drie verschillende, krachtige modellen om het wereldwijde handelspotentieel te maximaliseren.",
        "services_card1_title": "Ondersteunende Diensten",
        "services_card1_desc": "Export-/importondersteuning voor geregistreerde bedrijven en individuele handelaren.",
        "services_card1_bullet1": "End-to-end logistiek & douane",
        "services_card1_bullet2": "Leverancier/koper coördinatie",
        "services_card1_bullet3": "Naleving in VK/EU/IND",
        "services_card1_bullet4": "Opslag & distributie",
        "services_card2_title": "Inside Dealer",
        "services_card2_desc": "Marktgebaseerde externe handel die wereldwijde leveranciers verbindt met actieve kopers.",
        "services_card2_bullet1": "Wereldwijd marktonderzoek",
        "services_card2_bullet2": "Product sourcing & validatie",
        "services_card2_bullet3": "Dealstructurering & onderhandeling",
        "services_card2_bullet4": "Import/export management",
        "services_card3_title": "Direct Dealer",
        "services_card3_desc": "Merkeigendom en marktfaciltering voor hoogwaardige nicheproducten.",
        "services_card3_bullet1": "Selecteer kansrijke producten",
        "services_card3_bullet2": "Private-label & rebranding",
        "services_card3_bullet3": "Marktaanwezigheid in VK/EU/IND",
        "services_card3_bullet4": "Volledig eigendom van de toeleveringsketen",
        "services_section2_badge": "ONS PROCES",
        "services_section2_title": "Operationele Workflow",
        "services_section2_desc": "Ons robuuste 8-stappen werkprotocol garandeert efficiëntie, kwaliteit en marktgereedheid van concept tot distributie.",
        "services_step1_title": "Identificatie",
        "services_step1_desc": "Onderzoek trends, vind hiaten met een grote vraag en evalueer de schaalbaarheid.",
        "services_step2_title": "Verificatie",
        "services_step2_desc": "Valideer de geloofwaardigheid, capaciteit en strikte kwaliteitsnormen van leveranciers.",
        "services_step3_title": "Marktvalidatie",
        "services_step3_desc": "Identificeer doelkopers, voer vraagtests uit en analyseer de concurrentie.",
        "services_step4_title": "Modelbeslissing",
        "services_step4_desc": "Selecteer het beste pad: Support Service, Inside Dealer of Direct Dealer.",
        "services_step5_title": "Dealstructurering",
        "services_step5_desc": "Prijsstrategie, contracten, overeenkomsten en betalingsvoorwaarden afronden.",
        "services_step6_title": "Logistieke Uitvoering",
        "services_step6_desc": "Verzending, inklaring en levering aan magazijn regelen.",
        "services_step7_title": "Verkoop & Distributie",
        "services_step7_desc": "Rechtstreeks leveren aan kopers, marktaanbereik vergroten en volumes opschalen.",
        "services_step8_title": "Merkontwikkeling",
        "services_step8_desc": "(Direct Dealer) Creëer identiteit, verpakking en marketingcampagnes.",

        // Homepage
        "hero_title": "De Wereld Verbinden,<br><span class=\"gold-text\">Kwaliteit Leveren</span>",
        "hero_desc": "End-to-end logistieke oplossingen op maat van uw bedrijf. Snel, betrouwbaar en veilig – over de hele wereld.",
        "hero_btn_explore": "Ontdek Meer",
        "marquee_chain": "Wereldwijde Toeleveringsketen",
        "marquee_forwarding": "Freight Forwarding",
        "marquee_delivering": "Kwaliteit Leveren",
        "marquee_dist": "Strategische Distributie",
        "marquee_cargo": "Zee- & Luchtvracht",
        "marquee_nextgen": "Volgende Generatie Logistiek",
        "about_badge": "WIE WE ZIJN",
        "about_title": "Missie <span class=\"gold-text\">&</span> Visie",
        "about_subtitle": "Wereldwijde handel transformeren door kansrijke producten toegankelijk, schaalbaar en succesvol over grenzen heen te maken.",
        "about_vision_title": "Onze Visie",
        "about_vision_desc": "Een toonaangevende facilitator van wereldwijde handel en krachtpatser voor productontwikkeling worden die opkomende producten verbindt met markten met een grote vraag.",
        "about_concept_title": "Het Concept",
        "about_concept_desc": "HILLHEXO LTD treedt op als een brug tussen productoorsprong en marktvraag. Wij identificeren producten met een sterk potentieel, faciliteren logistiek, bouwen toeleveringsketens en creëren of vergroten markten.",
        "comp_badge": "WAAROM VOOR ONS KIEZEN",
        "comp_title": "Ons Concurrentievoordeel",
        "comp_card1_title": "Hybride Model",
        "comp_card1_desc": "Een unieke combinatie van logistieke ondersteuning, slimme handel en directe merkcreatie onder één dak.",
        "comp_card2_title": "Marktintelligenz",
        "comp_card2_desc": "Data-gestuurde productselectie zorgt ervoor dat we alleen producten opschalen met een hoge vraag en lage aanbodhiaten.",
        "comp_card3_title": "Flexibiliteit",
        "comp_card3_desc": "We passen onze modellen met succes aan om samen te werken met zowel opkomende, kleine leveranciers als grootschalige ondernemingen.",
        "comp_card4_title": "End-to-end Controle",
        "comp_card4_desc": "Van de eerste inkoop tot de uiteindelijke levering op de markt beheren we de volledige toeleveringsketen om succes te garanderen.",
        "market_badge": "WERELDWIJD BEREIK",
        "market_title": "Marktkansen",
        "market_desc": "Het wereldwijde aanbod neemt toe, maar de toegang tot de markt blijft gefragmenteerd. We maken gebruik van overheidsvrije handelsovereenkomsten om betere kansen op de wereldmarkt te brengen, en lossen problemen op die worden veroorakt door slechte logistiek, zwakke branding of toetredingsstrategieën.",
        "market_card1_title": "Doelmarkten",
        "market_card1_desc": "We richten ons op het VK, de Europese Unie en India, terwijl we actief opkomende markten in Azië, Afrika en Zuid-Amerika verkennen.",
        "market_card2_title": "Sectoren in Beeld",
        "market_card2_desc": "Consumentengoederen, landbouwproducten, industriële materialen, duurzame producten, technologische accessoires en mode."
    },
    "de": {
        // Navigation
        "nav_home": "Startseite",
        "nav_services": "Dienstleistungen",
        "nav_contact": "Kontakt",

        // Footer
        "footer_watermark": "HILLHEXO",
        "footer_subscribe_text": "Abonnieren Sie uns, um unsere neuesten Updates und Erkenntnisse zu erhalten.",
        "footer_subscribe_placeholder": "Geben Sie Ihre E-Mail-Adresse ein",
        "footer_quick_links": "Schnelllinks",
        "footer_newsletter": "Newsletter",
        "footer_copyright": "© 2026 HILLHEXO LTD. Alle Rechte vorbehalten.",

        // Contact Page
        "contact_banner_badge": "KONTAKTIEREN SIE UNS",
        "contact_banner_title": "VERBINDEN SIE SICH MIT <span class=\"gold-text\">UNS</span>",
        "contact_banner_desc": "Haben Sie ein Projekt, eine Anfrage oder eine Partnerschaftsmöglichkeit? Wenden Sie sich an unser globales Team, um Ihre Lieferkette für Wachstum zu strukturieren.",
        "contact_email_title": "E-Mail schreiben",
        "contact_hours_title": "Geschäftszeiten",
        "contact_hours_desc": "Montag - Freitag: 9:00 - 18:00 Uhr",
        "contact_label_name": "Name",
        "contact_label_email": "E-Mail-Adresse",
        "contact_label_phone": "Telefonnummer",
        "contact_label_company": "Firmenname",
        "contact_label_priority": "Prioritätsstatus",
        "contact_option_priority_default": "Priorität auswählen",
        "contact_option_priority_low": "Niedrig",
        "contact_option_priority_medium": "Mittel",
        "contact_option_priority_urgent": "Dringend",
        "contact_label_subject": "Betreff",
        "contact_label_message": "Nachricht",
        "contact_placeholder_name": "Max Mustermann",
        "contact_placeholder_email": "max@beispiel.de",
        "contact_placeholder_phone": "+44 7553 599805",
        "contact_placeholder_company": "Acme GmbH",
        "contact_placeholder_subject": "Partnerschaftsmöglichkeit",
        "contact_placeholder_message": "Wie können wir Ihrem Unternehmen helfen?",
        "contact_btn_submit": "Nachricht senden",
        "contact_modal_message_label": "Nachrichten-Anfragebox",
        "contact_modal_message_placeholder": "Beschreiben Sie Ihre Sendungsdetails oder Anfragen...",
        "contact_modal_submit_btn": "Anfrage senden",

        // Services Page
        "services_banner_badge": "KERNKOMPETENZEN",
        "services_banner_title": "UNSERE <span class=\"gold-text\">DIENSTLEISTUNGEN</span>",
        "services_banner_desc": "Wir nutzen unsere globale Reichweite gepaart mit tiefem, spezialisiertem Branchenwissen und bieten End-to-End-Support, Vermittlung als Inside Dealer sowie Marken-Eigentümerschaft als Direct Dealer.",
        "services_section1_badge": "WAS WIR TUN",
        "services_section1_title": "Kern-Geschäftsmodelle",
        "services_section1_desc": "Wir arbeiten mit drei unterschiedlichen, leistungsstarken Modellen, um das Potenzial des globalen Handels zu maximieren.",
        "services_card1_title": "Unterstützende Dienste",
        "services_card1_desc": "Export-/Importunterstützung für registrierte Unternehmen und Einzelhändler.",
        "services_card1_bullet1": "End-to-End-Logistik & Zoll",
        "services_card1_bullet2": "Koordination zwischen Lieferant und Käufer",
        "services_card1_bullet3": "Einhaltung von Vorschriften in UK/EU/IND",
        "services_card1_bullet4": "Lagerung & Vertrieb",
        "services_card2_title": "Inside Dealer",
        "services_card2_desc": "Marktbasierter Drittgruppenhandel, der globale Lieferanten mit aktiven Käufern verbindet.",
        "services_card2_bullet1": "Globale Marktforschung",
        "services_card2_bullet2": "Produktbeschaffung & -validierung",
        "services_card2_bullet3": "Deal-Strukturierung & Verhandlung",
        "services_card2_bullet4": "Import-/Exportmanagement",
        "services_card3_title": "Direct Dealer",
        "services_card3_desc": "Markeneigentum und Marktschaffung für vielversprechende Nischenprodukte.",
        "services_card3_bullet1": "Auswahl von Produkten mit hohem Potenzial",
        "services_card3_bullet2": "Private-Label & Rebranding",
        "services_card3_bullet3": "Marktpräsenz in UK/EU/IND",
        "services_card3_bullet4": "Vollständiges Eigentum an der Lieferkette",
        "services_section2_badge": "UNSER PROZESS",
        "services_section2_title": "Operativer Workflow",
        "services_section2_desc": "Unser robustes 8-stufiges Arbeitsrotokoll garantiert Effizienz, Qualität und Marktreife vom Konzept bis zum Vertrieb.",
        "services_step1_title": "Identifikation",
        "services_step1_desc": "Trends erforschen, Lücken mit hoher Nachfrage finden und Skalierbarkeit bewerten.",
        "services_step2_title": "Verifizierung",
        "services_step2_desc": "Glaubwürdigkeit, Kapazität und strenge Qualitätsstandards des Lieferanten validieren.",
        "services_step3_title": "Marktvalidierung",
        "services_step3_desc": "Zielkäufer identifizieren, Nachfragetests durchführen und Wettbewerb analysieren.",
        "services_step4_title": "Modellentscheidung",
        "services_step4_desc": "Wählen Sie den besten Weg: Support Service, Inside Dealer oder Direct Dealer.",
        "services_step5_title": "Deal-Strukturierung",
        "services_step5_desc": "Preisstrategie, Verträge, Vereinbarungen und Zahlungsbedingungen abschließen.",
        "services_step6_title": "Logistik-Ausführung",
        "services_step6_desc": "Versand, Zollabwicklung und Lieferung an das Lager organisieren.",
        "services_step7_title": "Verkauf & Vertrieb",
        "services_step7_desc": "Direkt an Käufer liefern, Marktreichweite ausbauen und Mengen skalieren.",
        "services_step8_title": "Markenentwicklung",
        "services_step8_desc": "(Direct Dealer) Identität, Verpackung und Marketingkampagnen erstellen.",

        // Homepage
        "hero_title": "Die Welt Verbinden,<br><span class=\"gold-text\">Exzellenz Liefern</span>",
        "hero_desc": "End-to-End-Logistiklösungen, maßgeschneidert für Ihr Unternehmen. Schnell, zuverlässig und sicher – auf der ganzen Welt.",
        "hero_btn_explore": "Mehr erfahren",
        "marquee_chain": "Globale Lieferkette",
        "marquee_forwarding": "Freight Forwarding",
        "marquee_delivering": "Exzellenz Liefern",
        "marquee_dist": "Strategischer Vertrieb",
        "marquee_cargo": "See- & Luftfracht",
        "marquee_nextgen": "Next-Gen Logistik",
        "about_badge": "WER WIR SIND",
        "about_title": "Mission <span class=\"gold-text\">&</span> Vision",
        "about_subtitle": "Den globalen Handel transformieren, indem vielversprechende Produkte über Grenzen hinweg zugänglich, skalierbar und erfolgreich gemacht werden.",
        "about_vision_title": "Unsere Vision",
        "about_vision_desc": "Ein führender Wegbereiter des globalen Handels und ein Innovationszentrum für Produktentwicklung zu werden, das aufstrebende Produkte mit Märkten mit hoher Nachfrage verbindt.",
        "about_concept_title": "Das Konzept",
        "about_concept_desc": "HILLHEXO LTD fungiert als Brücke zwischen Produktherkunft und Marktnachfrage. Wir identifizieren Produkte mit starkem Potenzial, erleichtern die Logistik, bauen Lieferketten auf und schaffen oder erweitern Märkte.",
        "comp_badge": "WARUM UNS WÄHLEN",
        "comp_title": "Unser Wettbewerbsvorteil",
        "comp_card1_title": "Hybrides Modell",
        "comp_card1_desc": "Eine einzigartige Kombination aus Logistikunterstützung, intelligentem Handel und direkter Markenbildung unter einem Dach.",
        "comp_card2_title": "Marktintelligenz",
        "comp_card2_desc": "Datengestützte Produktauswahl stellt sicher, dass wir nur Produkte skalieren, die eine hohe Nachfrage aufweisen und Versorgungslücken schließen.",
        "comp_card3_title": "Flexibilität",
        "comp_card3_desc": "Wir passen unsere Modelle erfolgreich an die Zusammenarbeit mit aufstrebenden, kleinen Lieferanten und Großunternehmen an.",
        "comp_card4_title": "End-to-End-Kontrolle",
        "comp_card4_desc": "Vom ersten Einkauf bis zur endgültigen Lieferung auf dem Markt verwalten wir die gesamte Lieferkette, um den Erfolg zu garantieren.",
        "market_badge": "GLOBALE REICHWEITE",
        "market_title": "Marktchancen",
        "market_desc": "Das weltweite Angebot wächst, aber der Marktzugang bleibt fragmentiert. Wir nutzen staatliche Freihandelsabkommen, um bessere Chancen auf den globalen Markt zu bringen, und beheben Mängel, die durch schlechte Logistik, schwaches Branding oder fehlerhafte Markteintrittsstrategie verursacht werden.",
        "market_card1_title": "Zielmärkte",
        "market_card1_desc": "Wir konzentrieren uns auf das Vereinigte Königreich, die Europäische Union und Indien, während wir aktiv aufstrebende Märkte in Asien, Afrika und Südamerika erschließen.",
        "market_card2_title": "Branchen im Fokus",
        "market_card2_desc": "Konsumgüter, landwirtschaftliche Produkte, Industriematerialien, nachhaltige Produkte, technologisches Zubehör und Mode."
    }
};

// Function to translate the page content dynamically
function translatePage(lang) {
    // Sanitize and save selected language (default to English 'en')
    const activeLang = (lang && translations[lang.toLowerCase()]) ? lang.toLowerCase() : 'en';
    localStorage.setItem('hillhexo_lang', activeLang);

    // Translate standard textContent elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[activeLang] && translations[activeLang][key] !== undefined) {
            el.textContent = translations[activeLang][key];
        }
    });

    // Translate HTML contents (for elements with formatting tags like span class="gold-text")
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (translations[activeLang] && translations[activeLang][key] !== undefined) {
            el.innerHTML = translations[activeLang][key];
        }
    });

    // Translate Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[activeLang] && translations[activeLang][key] !== undefined) {
            el.setAttribute('placeholder', translations[activeLang][key]);
        }
    });

    // Update Language Selection buttons text
    document.querySelectorAll('.lang-current').forEach(el => {
        el.textContent = activeLang.toUpperCase();
    });

    // Update active state in language dropdown list
    document.querySelectorAll('.lang-option').forEach(o => {
        if (o.getAttribute('data-lang').toLowerCase() === activeLang) {
            o.classList.add('active');
        } else {
            o.classList.remove('active');
        }
    });
}

// Attach immediate event listener for language initialization
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('hillhexo_lang') || 'en';
    translatePage(savedLang);

    // Global listener to wire translation options
    const langSwitchers = document.querySelectorAll('.lang-switcher');
    langSwitchers.forEach(langSwitcher => {
        const langOptions = langSwitcher.querySelectorAll('.lang-option');
        langOptions.forEach(opt => {
            opt.addEventListener('click', (e) => {
                const selectedLang = opt.getAttribute('data-lang');
                if (selectedLang) {
                    translatePage(selectedLang.toLowerCase());
                }
            });
        });
    });
});
