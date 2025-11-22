import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./CarbonEmissionsCalculator.css";
/* ================== SUGGESTIONS (CATEGORY-SPECIFIC) ================== */

const FLIGHT_SUGGESTIONS = {
  en: [
    "Explore virtual meeting alternatives to reduce flight emissions.",
    "Choose direct flights when air travel is necessary - they emit less CO2 than connecting flights.",
    "Consider high-speed rail or other ground transport for shorter distances (under 500 km).",
    "Offset emissions through verified carbon offset programs (Gold Standard, VCS).",
    "Fly economy class - business and first class have higher per-passenger emissions.",
    "Book with airlines that have newer, more fuel-efficient aircraft.",
    "Pack lighter - every kilogram counts toward fuel consumption.",
    "Choose daytime flights which have slightly lower climate impact than night flights.",
  ],
  fr: [
    "Explorez des alternatives de réunions virtuelles pour réduire les émissions des vols.",
    "Choisissez des vols directs lorsque le transport aérien est nécessaire - ils émettent moins de CO2.",
    "Envisagez le train à grande vitesse ou d'autres transports terrestres pour les distances courtes (moins de 500 km).",
    "Compensez les émissions par des programmes de compensation carbone vérifiés (Gold Standard, VCS).",
    "Voyagez en classe économique - la classe affaires et première classe ont des émissions par passager plus élevées.",
    "Réservez avec des compagnies aériennes qui ont des avions plus récents et plus économes en carburant.",
    "Voyagez léger - chaque kilogramme compte pour la consommation de carburant.",
    "Choisissez des vols de jour qui ont un impact climatique légèrement inférieur aux vols de nuit.",
  ],
  es: [
    "Explore alternativas de reuniones virtuales para reducir las emisiones de vuelos.",
    "Elija vuelos directos cuando el viaje aéreo sea necesario - emiten menos CO2 que los vuelos con conexión.",
    "Considere el tren de alta velocidad u otro transporte terrestre para distancias cortas (menos de 500 km).",
    "Compense las emisiones a través de programas verificados de compensación de carbono (Gold Standard, VCS).",
    "Vuele en clase económica - la clase business y primera clase tienen mayores emisiones por pasajero.",
    "Reserve con aerolíneas que tienen aviones más nuevos y eficientes en combustible.",
    "Empaque ligero - cada kilogramo cuenta para el consumo de combustible.",
    "Elija vuelos diurnos que tienen un impacto climático ligeramente menor que los vuelos nocturnos.",
  ],
};

const VEHICLE_SUGGESTIONS = {
  en: [
    "Carpool with colleagues when possible to reduce per-person emissions.",
    "Consider switching to electric or hybrid vehicles for lower emissions.",
    "Maintain your vehicle regularly to improve fuel efficiency and reduce emissions.",
    "Plan errands efficiently to reduce unnecessary trips and idling time.",
    "Keep tires properly inflated - this can improve fuel efficiency by up to 3%.",
    "Remove unnecessary weight from your vehicle to improve fuel economy.",
    "Use cruise control on highways to maintain steady speed and reduce fuel consumption.",
    "Avoid aggressive driving (rapid acceleration/braking) which increases fuel use by 30%.",
    "Consider car-sharing services when you don't need a vehicle daily.",
  ],
  fr: [
    "Partagez votre véhicule avec des collègues lorsque possible pour réduire les émissions par personne.",
    "Envisagez de passer aux véhicules électriques ou hybrides pour réduire les émissions.",
    "Entretenez régulièrement votre véhicule pour améliorer l'efficacité énergétique.",
    "Planifiez vos déplacements efficacement pour réduire les trajets inutiles et le ralenti.",
    "Maintenez vos pneus correctement gonflés - cela peut améliorer l'efficacité énergétique jusqu'à 3%.",
    "Retirez le poids inutile de votre véhicule pour améliorer l'économie de carburant.",
    "Utilisez le régulateur de vitesse sur les autoroutes pour maintenir une vitesse constante.",
    "Évitez la conduite agressive (accélération/freinage brusque) qui augmente la consommation de 30%.",
    "Envisagez les services d'autopartage lorsque vous n'avez pas besoin d'un véhicule quotidiennement.",
  ],
  es: [
    "Comparta el automóvil con colegas cuando sea posible para reducir las emisiones por persona.",
    "Considere cambiar a vehículos eléctricos o híbridos para emisiones más bajas.",
    "Mantenga su vehículo regularmente para mejorar la eficiencia del combustible.",
    "Planifique los recados eficientemente para reducir viajes innecesarios y tiempo de ralentí.",
    "Mantenga los neumáticos correctamente inflados - esto puede mejorar la eficiencia hasta un 3%.",
    "Retire el peso innecesario de su vehículo para mejorar la economía de combustible.",
    "Use el control de crucero en autopistas para mantener velocidad constante.",
    "Evite la conducción agresiva (aceleración/frenado rápido) que aumenta el uso de combustible en 30%.",
    "Considere servicios de uso compartido de automóviles cuando no necesite un vehículo diariamente.",
  ],
};

const VESSEL_SUGGESTIONS = {
  en: [
    "For leisure boating, consider electric or sail-powered options for zero direct emissions.",
    "Optimize routes to minimize distance traveled and fuel consumption.",
    "Reduce speed to improve fuel efficiency - slower speeds can cut emissions by 20-30%.",
    "Regular maintenance improves fuel efficiency and reduces emissions.",
    "Use biofuels or alternative marine fuels where available.",
    "Install energy-efficient equipment and LED navigation lights.",
    "Consider hull cleaning to reduce drag and improve efficiency.",
    "Plan trips during favorable weather to reduce fuel consumption.",
  ],
  fr: [
    "Pour la navigation de plaisance, envisagez des options électriques ou à voile pour zéro émission directe.",
    "Optimisez les itinéraires pour minimiser la distance parcourue et la consommation de carburant.",
    "Réduisez la vitesse pour améliorer l'efficacité énergétique - les vitesses plus lentes peuvent réduire les émissions de 20-30%.",
    "L'entretien régulier améliore l'efficacité énergétique et réduit les émissions.",
    "Utilisez des biocarburants ou des carburants marins alternatifs lorsque disponibles.",
    "Installez des équipements économes en énergie et des feux de navigation LED.",
    "Envisagez le nettoyage de la coque pour réduire la traînée et améliorer l'efficacité.",
    "Planifiez les trajets pendant des conditions météorologiques favorables pour réduire la consommation.",
  ],
  es: [
    "Para navegación recreativa, considere opciones eléctricas o de vela para emisiones directas cero.",
    "Optimice las rutas para minimizar la distancia recorrida y el consumo de combustible.",
    "Reduzca la velocidad para mejorar la eficiencia del combustible - velocidades más lentas pueden reducir emisiones 20-30%.",
    "El mantenimiento regular mejora la eficiencia del combustible y reduce las emisiones.",
    "Use biocombustibles o combustibles marinos alternativos cuando estén disponibles.",
    "Instale equipos eficientes en energía y luces de navegación LED.",
    "Considere la limpieza del casco para reducir el arrastre y mejorar la eficiencia.",
    "Planifique viajes durante clima favorable para reducir el consumo de combustible.",
  ],
};

const PUBLIC_TRANSPORT_SUGGESTIONS = {
  en: [
    "You're already making a great choice by using public transport!",
    "Combine walking or cycling with public transport for even lower emissions.",
    "Choose buses/trains over taxis for further emissions reduction.",
    "Consider a monthly pass to encourage regular public transit use.",
    "Use transit apps to optimize routes and reduce waiting time.",
    "Advocate for improved public transportation infrastructure in your community.",
    "Share your positive public transit experiences to encourage others.",
  ],
  fr: [
    "Vous faites déjà un excellent choix en utilisant les transports en commun!",
    "Combinez la marche ou le vélo avec les transports en commun pour des émissions encore plus faibles.",
    "Choisissez les bus/trains plutôt que les taxis pour une réduction supplémentaire des émissions.",
    "Envisagez un abonnement mensuel pour encourager l'utilisation régulière des transports en commun.",
    "Utilisez des applications de transport pour optimiser les itinéraires et réduire le temps d'attente.",
    "Plaidez pour une amélioration de l'infrastructure de transport public dans votre communauté.",
    "Partagez vos expériences positives de transport en commun pour encourager les autres.",
  ],
  es: [
    "¡Ya está tomando una gran decisión al usar el transporte público!",
    "Combine caminar o andar en bicicleta con el transporte público para emisiones aún más bajas.",
    "Elija autobuses/trenes en lugar de taxis para una mayor reducción de emisiones.",
    "Considere un pase mensual para fomentar el uso regular del transporte público.",
    "Use aplicaciones de tránsito para optimizar rutas y reducir el tiempo de espera.",
    "Abogue por una mejor infraestructura de transporte público en su comunidad.",
    "Comparta sus experiencias positivas de transporte público para alentar a otros.",
  ],
};

const FREIGHT_SUGGESTIONS = {
  en: [
    "Consolidate shipments to reduce the number of trips required.",
    "Optimize routes using logistics software for delivery efficiency.",
    "Consider multi-modal transport options (e.g., rail-sea-road) for long distances.",
    "Switch to lower-emission vehicles for freight when possible.",
    "Use full truckloads to maximize efficiency per shipment.",
    "Consider electric or hybrid delivery vehicles for urban routes.",
    "Implement just-in-time delivery to reduce storage and multiple shipments.",
    "Partner with logistics providers that have carbon reduction commitments.",
    "Use lighter packaging materials to reduce overall shipping weight.",
  ],
  fr: [
    "Consolidez les expéditions pour réduire le nombre de trajets requis.",
    "Optimisez les itinéraires avec des logiciels logistiques pour l'efficacité de livraison.",
    "Envisagez des options de transport multimodal (rail-mer-route) pour les longues distances.",
    "Passez à des véhicules à émissions plus faibles pour le fret lorsque possible.",
    "Utilisez des chargements complets pour maximiser l'efficacité par expédition.",
    "Envisagez des véhicules de livraison électriques ou hybrides pour les itinéraires urbains.",
    "Mettez en œuvre la livraison juste-à-temps pour réduire le stockage.",
    "Partenariez avec des fournisseurs logistiques ayant des engagements de réduction carbone.",
    "Utilisez des matériaux d'emballage plus légers pour réduire le poids d'expédition.",
  ],
  es: [
    "Consolide envíos para reducir el número de viajes requeridos.",
    "Optimice rutas usando software logístico para eficiencia de entrega.",
    "Considere opciones de transporte multimodal (ferrocarril-mar-carretera) para largas distancias.",
    "Cambie a vehículos de menor emisión para carga cuando sea posible.",
    "Use cargas completas de camiones para maximizar la eficiencia por envío.",
    "Considere vehículos de entrega eléctricos o híbridos para rutas urbanas.",
    "Implemente entrega justo a tiempo para reducir almacenamiento y múltiples envíos.",
    "Asóciese con proveedores logísticos que tengan compromisos de reducción de carbono.",
    "Use materiales de embalaje más ligeros para reducir el peso total de envío.",
  ],
};

const WATER_SUGGESTIONS = {
  en: [
    "Reduce water consumption in operations to decrease treatment and transport energy.",
    "Install low-flow fixtures or water-efficient appliances throughout facilities.",
    "Reuse water where possible (e.g., irrigation, cooling systems, grey water).",
    "Fix leaks promptly - a small leak can waste thousands of liters annually.",
    "Implement rainwater harvesting systems for non-potable uses.",
    "Use water-efficient landscaping with native, drought-resistant plants.",
    "Monitor water usage regularly to identify reduction opportunities.",
    "Educate staff about water conservation practices.",
  ],
  fr: [
    "Réduisez la consommation d'eau dans les opérations pour diminuer l'énergie de traitement.",
    "Installez des accessoires à faible débit ou des appareils économes en eau.",
    "Réutilisez l'eau lorsque possible (irrigation, systèmes de refroidissement, eaux grises).",
    "Réparez les fuites rapidement - une petite fuite peut gaspiller des milliers de litres par an.",
    "Mettez en œuvre des systèmes de récupération d'eau de pluie pour usages non potables.",
    "Utilisez un aménagement paysager économe en eau avec des plantes indigènes résistantes à la sécheresse.",
    "Surveillez régulièrement l'utilisation de l'eau pour identifier les opportunités de réduction.",
    "Éduquez le personnel sur les pratiques de conservation de l'eau.",
  ],
  es: [
    "Reduzca el consumo de agua en operaciones para disminuir la energía de tratamiento y transporte.",
    "Instale accesorios de bajo flujo o electrodomésticos eficientes en agua.",
    "Reutilice el agua cuando sea posible (riego, sistemas de enfriamiento, aguas grises).",
    "Repare las fugas rápidamente - una pequeña fuga puede desperdiciar miles de litros anualmente.",
    "Implemente sistemas de recolección de agua de lluvia para usos no potables.",
    "Use paisajismo eficiente en agua con plantas nativas resistentes a la sequía.",
    "Monitoree el uso de agua regularmente para identificar oportunidades de reducción.",
    "Eduque al personal sobre prácticas de conservación de agua.",
  ],
};

const WASTE_SUGGESTIONS = {
  en: [
    "Implement a comprehensive recycling program for all materials.",
    "Reduce waste generation by optimizing processes and materials usage.",
    "Compost organic waste to reduce landfill emissions and create useful soil.",
    "Partner with waste-to-energy facilities if available in your area.",
    "Conduct waste audits to identify reduction opportunities.",
    "Choose products with minimal or recyclable packaging.",
    "Implement a zero-waste policy with measurable reduction targets.",
    "Donate usable items instead of discarding them.",
    "Use reusable containers, dishware, and utensils instead of disposables.",
    "Work with suppliers to reduce packaging waste.",
  ],
  fr: [
    "Mettez en œuvre un programme complet de recyclage pour tous les matériaux.",
    "Réduisez la génération de déchets en optimisant les processus et l'utilisation des matériaux.",
    "Compostez les déchets organiques pour réduire les émissions d'enfouissement.",
    "Partenariez avec des installations de valorisation énergétique si disponibles.",
    "Effectuez des audits de déchets pour identifier les opportunités de réduction.",
    "Choisissez des produits avec un emballage minimal ou recyclable.",
    "Mettez en œuvre une politique zéro déchet avec des objectifs de réduction mesurables.",
    "Donnez des articles utilisables au lieu de les jeter.",
    "Utilisez des contenants, de la vaisselle et des ustensiles réutilisables.",
    "Travaillez avec les fournisseurs pour réduire les déchets d'emballage.",
  ],
  es: [
    "Implemente un programa integral de reciclaje para todos los materiales.",
    "Reduzca la generación de residuos optimizando procesos y uso de materiales.",
    "Composte residuos orgánicos para reducir emisiones de vertederos.",
    "Asóciese con instalaciones de conversión de residuos en energía si están disponibles.",
    "Realice auditorías de residuos para identificar oportunidades de reducción.",
    "Elija productos con embalaje mínimo o reciclable.",
    "Implemente una política de cero residuos con objetivos de reducción medibles.",
    "Done artículos utilizables en lugar de desecharlos.",
    "Use contenedores, vajilla y utensilios reutilizables en lugar de desechables.",
    "Trabaje con proveedores para reducir los residuos de embalaje.",
  ],
};

const COMMUTING_SUGGESTIONS = {
  en: [
    "Encourage employees to carpool, use public transport, or cycle to work.",
    "Offer flexible work-from-home or remote work options to reduce commuting.",
    "Provide incentives for low-emission commuting (subsidies, preferred parking).",
    "Establish carpooling/vanpooling programs for staff with similar routes.",
    "Install bike racks and shower facilities to encourage cycling.",
    "Offer compressed work weeks (4x10 hours) to reduce commute days.",
    "Provide electric vehicle charging stations at the workplace.",
    "Consider shuttle services from major transit hubs.",
    "Implement a commute tracking and reward system for sustainable choices.",
    "Support telecommuting with proper technology and equipment.",
  ],
  fr: [
    "Encouragez les employés à covoiturer, utiliser les transports en commun ou faire du vélo.",
    "Offrez des options de travail à domicile flexibles pour réduire les déplacements.",
    "Fournissez des incitatifs pour les déplacements à faibles émissions.",
    "Établissez des programmes de covoiturage pour le personnel avec des itinéraires similaires.",
    "Installez des supports à vélos et des douches pour encourager le cyclisme.",
    "Offrez des semaines de travail comprimées (4x10 heures) pour réduire les jours de déplacement.",
    "Fournissez des stations de recharge pour véhicules électriques au travail.",
    "Envisagez des services de navette depuis les principaux centres de transport.",
    "Mettez en œuvre un système de suivi et de récompense pour les choix durables.",
    "Soutenez le télétravail avec la technologie et l'équipement appropriés.",
  ],
  es: [
    "Anime a los empleados a compartir el automóvil, usar transporte público o ir en bicicleta.",
    "Ofrezca opciones flexibles de trabajo desde casa para reducir los desplazamientos.",
    "Proporcione incentivos para desplazamientos de bajas emisiones.",
    "Establezca programas de viaje compartido para el personal con rutas similares.",
    "Instale estacionamientos para bicicletas y duchas para fomentar el ciclismo.",
    "Ofrezca semanas laborales comprimidas (4x10 horas) para reducir días de desplazamiento.",
    "Proporcione estaciones de carga para vehículos eléctricos en el lugar de trabajo.",
    "Considere servicios de transporte desde los principales centros de tránsito.",
    "Implemente un sistema de seguimiento y recompensa para opciones sostenibles.",
    "Apoye el teletrabajo con tecnología y equipo adecuados.",
  ],
};

const EVENT_SUGGESTIONS = {
  en: [
    "Encourage attendees to use public transport or carpooling arrangements.",
    "Choose venues close to public transportation hubs for easy access.",
    "Offer virtual or hybrid attendance options to reduce travel emissions.",
    "Serve plant-based or locally sourced meals to reduce food carbon footprint.",
    "Use renewable energy sources if available for powering the event.",
    "Consider a comprehensive event sustainability audit to identify all reduction opportunities.",
    "Provide clear recycling and composting stations throughout the venue.",
    "Use digital materials instead of printed programs and handouts.",
    "Choose venues with green certifications (LEED, Green Key).",
    "Offset event emissions through verified carbon offset projects.",
    "Use reusable decorations and materials instead of single-use items.",
    "Partner with caterers who minimize food waste and use sustainable practices.",
    "Provide bike parking and encourage active transportation.",
    "Train your event planning team in sustainable event management practices.",
  ],
  fr: [
    "Encouragez les participants à utiliser les transports en commun ou le covoiturage.",
    "Choisissez des lieux proches des centres de transport public pour un accès facile.",
    "Offrez des options de participation virtuelle ou hybride pour réduire les émissions de voyage.",
    "Servez des repas à base de plantes ou d'origine locale pour réduire l'empreinte carbone.",
    "Utilisez des sources d'énergie renouvelable si disponibles pour alimenter l'événement.",
    "Envisagez un audit de durabilité complet de l'événement.",
    "Fournissez des stations de recyclage et de compostage claires dans tout le lieu.",
    "Utilisez des matériaux numériques au lieu de programmes et documents imprimés.",
    "Choisissez des lieux avec des certifications vertes (LEED, Green Key).",
    "Compensez les émissions de l'événement par des projets de compensation carbone vérifiés.",
    "Utilisez des décorations et matériaux réutilisables au lieu d'articles à usage unique.",
    "Partenariez avec des traiteurs qui minimisent le gaspillage alimentaire.",
    "Fournissez un stationnement pour vélos et encouragez le transport actif.",
    "Formez votre équipe de planification d'événements aux pratiques de gestion durable.",
  ],
  es: [
    "Anime a los asistentes a usar transporte público o arreglos de viaje compartido.",
    "Elija lugares cercanos a centros de transporte público para fácil acceso.",
    "Ofrezca opciones de asistencia virtual o híbrida para reducir emisiones de viaje.",
    "Sirva comidas a base de plantas o de origen local para reducir la huella de carbono.",
    "Use fuentes de energía renovable si están disponibles para alimentar el evento.",
    "Considere una auditoría integral de sostenibilidad del evento.",
    "Proporcione estaciones claras de reciclaje y compostaje en todo el lugar.",
    "Use materiales digitales en lugar de programas y folletos impresos.",
    "Elija lugares con certificaciones verdes (LEED, Green Key).",
    "Compense las emisiones del evento a través de proyectos verificados de compensación de carbono.",
    "Use decoraciones y materiales reutilizables en lugar de artículos de un solo uso.",
    "Asóciese con proveedores de catering que minimicen el desperdicio de alimentos.",
    "Proporcione estacionamiento para bicicletas y fomente el transporte activo.",
    "Capacite a su equipo de planificación de eventos en prácticas de gestión sostenible.",
  ],
};

const INDOOR_GATHERING_SUGGESTIONS = {
  en: [
    "Switch to renewable electricity sources or purchase green energy certificates.",
    "Upgrade to LED lighting and energy-efficient appliances throughout the facility.",
    "Improve building insulation to reduce heating and cooling energy needs.",
    "Schedule a professional facility energy audit to identify efficiency improvements.",
    "Implement comprehensive waste separation (landfill, recycling, composting).",
    "Install low-flow water fixtures to reduce water consumption and heating energy.",
    "Encourage attendees to use sustainable transport options.",
    "Serve vegetarian or locally sourced meals to lower food emissions.",
    "Use programmable thermostats to optimize heating and cooling schedules.",
    "Install solar panels or other renewable energy systems where feasible.",
    "Conduct regular energy audits to identify reduction opportunities.",
    "Invest in facility management training focused on sustainability and efficiency.",
    "Use natural ventilation when possible instead of air conditioning.",
    "Provide water refill stations to reduce bottled water consumption.",
    "Choose eco-friendly cleaning products and practices.",
    "Implement a green purchasing policy for all supplies and materials.",
  ],
  fr: [
    "Passez à des sources d'électricité renouvelable ou achetez des certificats d'énergie verte.",
    "Passez à l'éclairage LED et aux appareils économes en énergie.",
    "Améliorez l'isolation du bâtiment pour réduire les besoins en chauffage et climatisation.",
    "Planifiez un audit énergétique professionnel de l'installation.",
    "Mettez en œuvre une séparation complète des déchets (enfouissement, recyclage, compostage).",
    "Installez des accessoires à faible débit pour réduire la consommation d'eau.",
    "Encouragez les participants à utiliser des options de transport durable.",
    "Servez des repas végétariens ou d'origine locale pour réduire les émissions alimentaires.",
    "Utilisez des thermostats programmables pour optimiser les horaires de chauffage et climatisation.",
    "Installez des panneaux solaires ou d'autres systèmes d'énergie renouvelable si possible.",
    "Effectuez des audits énergétiques réguliers pour identifier les opportunités de réduction.",
    "Investissez dans la formation en gestion d'installations axée sur la durabilité.",
    "Utilisez la ventilation naturelle lorsque possible au lieu de la climatisation.",
    "Fournissez des stations de remplissage d'eau pour réduire la consommation d'eau embouteillée.",
    "Choisissez des produits et pratiques de nettoyage écologiques.",
    "Mettez en œuvre une politique d'achat vert pour toutes les fournitures et matériaux.",
  ],
  es: [
    "Cambie a fuentes de electricidad renovable o compre certificados de energía verde.",
    "Actualice a iluminación LED y electrodomésticos eficientes en energía.",
    "Mejore el aislamiento del edificio para reducir las necesidades de calefacción y refrigeración.",
    "Programe una auditoría energética profesional de las instalaciones.",
    "Implemente separación integral de residuos (vertedero, reciclaje, compostaje).",
    "Instale accesorios de bajo flujo para reducir el consumo de agua.",
    "Anime a los asistentes a usar opciones de transporte sostenible.",
    "Sirva comidas vegetarianas o de origen local para reducir las emisiones de alimentos.",
    "Use termostatos programables para optimizar los horarios de calefacción y refrigeración.",
    "Instale paneles solares u otros sistemas de energía renovable cuando sea factible.",
    "Realice auditorías energéticas regulares para identificar oportunidades de reducción.",
    "Invierta en capacitación de gestión de instalaciones enfocada en sostenibilidad.",
    "Use ventilación natural cuando sea posible en lugar de aire acondicionado.",
    "Proporcione estaciones de recarga de agua para reducir el consumo de agua embotellada.",
    "Elija productos y prácticas de limpieza ecológicos.",
    "Implemente una política de compras verdes para todos los suministros y materiales.",
  ],
};

const SME_SUGGESTIONS = {
  en: {
    totalEmissions: "Your total CO2e for the period is:",
    primarySources:
      "Primary emission sources identified: Electricity, Natural Gas, Vehicle Fuels.",
    suggestions: [
      "Consider conducting a detailed carbon footprint assessment to identify all emission sources across your operations.",
      "Professional physical audits of your facilities can uncover 15-30% efficiency improvement opportunities.",
      "Enroll your management team in corporate sustainability training to build internal capacity for carbon management.",
      "To reduce your electricity emissions, explore Hydro-Québec's Efficient Solutions Program for financial assistance with electricity-saving measures like LED lighting or heat pumps.",
      "If you use natural gas, investigate Énergir's programs or ÉcoPerformance for grants related to heating system upgrades or dual-energy conversions.",
      "For your vehicle fleet, consider transitioning to electric vehicles (EVs) and apply for the Quebec Roulez vert program rebates for vehicles and charging stations.",
      "Implement a comprehensive waste reduction and recycling program for your office/business operations.",
      "A structured carbon reduction course can help your team identify actionable opportunities specific to your industry.",
      "Set science-based reduction targets aligned with the Paris Agreement (1.5°C pathway).",
      "Engage with employees on sustainability initiatives to build a culture of environmental responsibility.",
      "Explore opportunities for on-site renewable energy generation (solar, geothermal).",
      "Implement energy management systems (ISO 50001) to systematically reduce consumption.",
      "Regular carbon footprint monitoring and reporting can demonstrate your environmental leadership to clients.",
    ],
  },
  fr: {
    totalEmissions: "Votre total de CO2e pour la période est:",
    primarySources:
      "Sources d'émissions principales identifiées: Électricité, Gaz Naturel, Carburants Véhicules.",
    suggestions: [
      "Envisagez de réaliser une évaluation détaillée de l'empreinte carbone pour identifier toutes les sources d'émissions.",
      "Les audits physiques professionnels peuvent découvrir 15-30% d'opportunités d'amélioration de l'efficacité.",
      "Inscrivez votre équipe de direction à une formation en durabilité d'entreprise.",
      "Pour réduire vos émissions d'électricité, explorez le programme Solutions efficaces d'Hydro-Québec pour une aide financière.",
      "Si vous utilisez du gaz naturel, renseignez-vous sur les programmes d'Énergir ou ÉcoPerformance.",
      "Pour votre flotte de véhicules, envisagez de passer aux véhicules électriques (VE) et profitez du programme Roulez vert du Québec.",
      "Mettez en œuvre un programme complet de réduction et de recyclage des déchets.",
      "Un cours structuré de réduction carbone peut aider votre équipe à identifier des opportunités spécifiques à votre industrie.",
      "Fixez des objectifs de réduction basés sur la science alignés avec l'Accord de Paris (trajectoire 1,5°C).",
      "Engagez les employés dans des initiatives de durabilité pour créer une culture de responsabilité environnementale.",
      "Explorez les opportunités de production d'énergie renouvelable sur site (solaire, géothermique).",
      "Mettez en œuvre des systèmes de gestion de l'énergie (ISO 50001) pour réduire systématiquement la consommation.",
      "Le suivi et le rapport réguliers de l'empreinte carbone peuvent démontrer votre leadership environnemental.",
    ],
  },
  es: {
    totalEmissions: "Su total de CO2e para el período es:",
    primarySources:
      "Fuentes de emisiones principales identificadas: Electricidad, Gas Natural, Combustibles de Vehículos.",
    suggestions: [
      "Considere realizar una evaluación detallada de la huella de carbono para identificar todas las fuentes de emisiones.",
      "Las auditorías físicas profesionales pueden descubrir oportunidades de mejora de eficiencia del 15-30%.",
      "Inscriba a su equipo de gestión en capacitación sobre sostenibilidad corporativa.",
      "Para reducir sus emisiones de electricidad, explore el programa de Soluciones Eficientes de Hydro-Québec para asistencia financiera.",
      "Si usa gas natural, investigue los programas de Énergir o ÉcoPerformance para subvenciones.",
      "Para su flota de vehículos, considere la transición a vehículos eléctricos (EV) y solicite los reembolsos del programa Roulez vert de Quebec.",
      "Implemente un programa integral de reducción de residuos y reciclaje para sus operaciones comerciales.",
      "Un curso estructurado de reducción de carbono puede ayudar a su equipo a identificar oportunidades específicas de su industria.",
      "Establezca objetivos de reducción basados en la ciencia alineados con el Acuerdo de París (trayectoria de 1,5°C).",
      "Involucre a los empleados en iniciativas de sostenibilidad para construir una cultura de responsabilidad ambiental.",
      "Explore oportunidades para generación de energía renovable en el sitio (solar, geotérmica).",
      "Implemente sistemas de gestión de energía (ISO 50001) para reducir sistemáticamente el consumo.",
      "El monitoreo y reporte regular de la huella de carbono puede demostrar su liderazgo ambiental.",
    ],
  },
};

const GENERAL_SUGGESTIONS_POOL = {
  en: [
    "Consider conducting a detailed carbon footprint assessment to identify all emission sources.",
    "Enroll your team in corporate sustainability training to build capacity for carbon reduction.",
    "Request a professional physical audit of your facilities to uncover hidden inefficiencies.",
    "Set measurable carbon reduction targets and track progress monthly.",
    "Educate your team about carbon footprint and climate action strategies through structured courses.",
    "Professional energy audits can identify 15-30% savings opportunities in most facilities.",
    "Consider purchasing carbon offsets to neutralize your remaining emissions.",
    "Switch to renewable energy providers or install solar panels where feasible.",
    "Implement a green procurement policy prioritizing low-carbon products.",
    "Conduct regular energy audits to identify reduction opportunities.",
    "Invest in employee training on sustainability and environmental responsibility.",
    "Join industry initiatives for carbon reduction and best practice sharing.",
    "Consider carbon labeling for your products or services.",
    "Engage with suppliers to reduce upstream emissions in your value chain.",
    "Implement circular economy principles to minimize waste and resource use.",
    "Support reforestation projects or local environmental conservation efforts.",
    "Use cloud computing services powered by renewable energy.",
    "Optimize your HVAC systems with smart thermostats and regular maintenance.",
    "Consider telecommuting policies to reduce commuting emissions.",
    "Switch to paperless operations where possible to reduce resource consumption.",
    "Install motion sensors for lighting to reduce unnecessary energy use.",
    "Choose energy-efficient appliances and equipment (ENERGY STAR certified).",
    "Implement a comprehensive recycling and composting program.",
    "Use natural lighting and ventilation where possible to reduce energy needs.",
    "Consider green building certifications (LEED, BOMA BEST) for facilities.",
    "Establish partnerships with local carbon reduction organizations.",
    "Create incentive programs for employees who choose sustainable commuting.",
    "Monitor and report your carbon footprint annually for transparency.",
    "A comprehensive carbon audit can reveal opportunities you might have missed.",
    "Use videoconferencing to reduce business travel emissions.",
    "Choose suppliers and partners with strong environmental commitments.",
    "Implement water conservation measures to reduce treatment energy.",
    "Consider carbon-neutral shipping options for deliveries.",
    "Support local suppliers to reduce transportation emissions.",
    "Use eco-friendly cleaning products to reduce chemical impacts.",
    "Benchmark your emissions against industry standards to identify improvement areas.",
    "Corporate sustainability workshops can align your entire team toward carbon reduction goals.",
  ],
  fr: [],
  es: [],
};

/* ================== EMISSION FACTORS ================== */

// Flights (kg CO2e per km)
const FLIGHT_FACTORS = {
  recreational_aircraft: 0.25,
  commercial_aircraft: 0.09,
  amphibious_aircraft: 0.3,
  helicopter: 0.4,
};
// Vehicles (kg CO2e per km)
const VEHICLE_FACTORS = {
  sedan: 0.12,
  van: 0.18,
  suv_4x4: 0.22,
  truck: 0.3,
};
// Vessels (kg CO2e per km)
const VESSEL_FACTORS = {
  motor_boat_gasoline: 0.5,
  motor_boat_diesel: 0.6,
  electric_sail_boat: 0.01,
  yacht_gasoline: 1.5,
  yacht_diesel: 1.8,
  yacht_electric: 0.05,
};

// Event factors
const FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR = 0.1; // kg per km per attendee
const FIXED_EVENT_MEAL_FACTOR = 1.2; // kg per meal

// Indoor / building factors
const FIXED_ELECTRICITY_EMISSION_FACTOR = 0.0016; // kg per kWh
const FIXED_NATURAL_GAS_EMISSION_FACTOR = 2.02; // kg per m³
const FIXED_BUILDING_WATER_EMISSION_FACTOR = 0.0003; // kg per L
const FIXED_LANDFILLED_WASTE_EMISSION_FACTOR = 0.5; // kg per kg
const FIXED_RECYCLED_WASTE_EMISSION_FACTOR = 0.1; // kg per kg
const FIXED_COMPOSTED_WASTE_EMISSION_FACTOR = 0.05; // kg per kg

// SME fuels
const FIXED_GASOLINE_EMISSION_FACTOR = 2.32; // kg per L
const FIXED_DIESEL_EMISSION_FACTOR = 2.68; // kg per L

// Other travel and resources
const FIXED_PUBLIC_TRANSPORT_EMISSION_FACTOR = 0.05; // kg per km
const FIXED_FREIGHT_BLENDED_EMISSION_FACTOR_PER_TONNE = 0.5; // kg per tonne
const FIXED_WATER_BLENDED_EMISSION_FACTOR = 0.0003; // kg per L
const FIXED_WASTE_BLENDED_EMISSION_FACTOR = 0.2; // kg per kg
const FIXED_COMMUTE_DAYS_PER_YEAR = 250;
const FIXED_COMMUTE_BLENDED_EMISSION_FACTOR = 0.1; // kg per km per person

/* ================== HELPERS ================== */

const toNum = (v) => (v === "" || isNaN(Number(v)) ? 0 : Number(v));

const fmtKgT = (kg) =>
  `${kg.toFixed(2)} kg (${(kg / 1000).toFixed(3)} tonnes)`;

/**
 * Returns up to `count` random general suggestions in the selected language.
 */
const getRandomGeneralSuggestions = (lang, count) => {
  const pool =
    GENERAL_SUGGESTIONS_POOL[lang] && GENERAL_SUGGESTIONS_POOL[lang].length
      ? GENERAL_SUGGESTIONS_POOL[lang]
      : GENERAL_SUGGESTIONS_POOL.en;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/* ================== MAIN COMPONENT ================== */

const CarbonEmissionsCalculator = () => {
  const { t, i18n } = useTranslation();

  const rawLang = i18n.language || "en";
  const baseLang = rawLang.split("-")[0];
  const uiLang =
    baseLang === "fr" || baseLang === "es" || baseLang === "en"
      ? baseLang
      : "en";

  const [activeTab, setActiveTab] = useState("sme");

  const [sme, setSme] = useState({
    companyName: "",
    contact: "",
    email: "",
    phone: "",
    startDate: "",
    endDate: "",
    industry: "",
    employees: "",
    buildingArea: "",
    electricityKWh: "",
    naturalGasM3: "",
    gasolineLiters: "",
    dieselLiters: "",
  });

  const [micro, setMicro] = useState({
    eventName: "",
    contact: "",
    email: "",
    phone: "",
    attendees: "",
    avgTravelKm: "",
    mealsPerAttendee: "",
    durationHours: "",
  });

  const [macro, setMacro] = useState({
    eventName: "",
    contact: "",
    email: "",
    phone: "",
    attendees: "",
    avgTravelKm: "",
    mealsPerAttendee: "",
    durationHours: "",
    electricityKWh: "",
    naturalGasM3: "",
    waterLiters: "",
    landfilledWasteKg: "",
    recycledWasteKg: "",
    compostedWasteKg: "",
  });

  const [other, setOther] = useState({
    flightsType: "recreational_aircraft",
    flightsDistance: "",
    vehicleType: "sedan",
    vehicleDistance: "",
    vesselType: "motor_boat_gasoline",
    vesselDistance: "",
    publicTransportDistance: "",
    freightWeight: "",
    waterConsumed: "",
    totalWaste: "",
    commuteDistance: "",
  });

  // Result objects: { text, suggestions[], error }
  const emptyResult = { text: "", suggestions: [], error: "" };

  const [smeResult, setSmeResult] = useState(emptyResult);
  const [microResult, setMicroResult] = useState(emptyResult);
  const [macroResult, setMacroResult] = useState(emptyResult);
  const [otherResult, setOtherResult] = useState(emptyResult);

  const totalLabel = t(
    "carbon.totalLabel",
    "Total CO2e Emissions"
  );
  const resultPlaceholder = t(
    "carbon.resultPlaceholder",
    "Your CO2e calculation will appear here."
  );

  /* ========== SME CALC ========== */

  const calculateSME = () => {
    if (!sme.companyName.trim()) {
      setSmeResult({
        text: "",
        suggestions: [],
        error: t(
          "carbon.errors.smeCompanyNameRequired",
          "Please enter a company name."
        ),
      });
      return;
    }

    const elec = toNum(sme.electricityKWh) * FIXED_ELECTRICITY_EMISSION_FACTOR;
    const gas = toNum(sme.naturalGasM3) * FIXED_NATURAL_GAS_EMISSION_FACTOR;
    const gasoline =
      toNum(sme.gasolineLiters) * FIXED_GASOLINE_EMISSION_FACTOR;
    const diesel =
      toNum(sme.dieselLiters) * FIXED_DIESEL_EMISSION_FACTOR;
    const total = elec + gas + gasoline + diesel;

    if (total <= 0) {
      setSmeResult({
        text: "",
        suggestions: [],
        error: t(
          "carbon.errors.smeZeroValues",
          "Please enter non-zero energy or fuel values to calculate SME emissions."
        ),
      });
      return;
    }

    const baseText = `${totalLabel}: ${fmtKgT(total)}`;

    const smeLang = SME_SUGGESTIONS[uiLang] || SME_SUGGESTIONS.en;
    const MAX_SUGGESTIONS = 12;

    const specificSuggestions = [
      `<strong>${t(
        "carbon.sme.companyLabel",
        "Company"
      )}: ${sme.companyName.trim()}</strong>`,
      `${smeLang.totalEmissions} ${total.toFixed(2)} kg CO2e.`,
      smeLang.primarySources,
      ...smeLang.suggestions,
    ];

    let finalSuggestions = specificSuggestions;
    if (specificSuggestions.length > MAX_SUGGESTIONS) {
      finalSuggestions = specificSuggestions.slice(0, MAX_SUGGESTIONS);
    } else if (specificSuggestions.length < MAX_SUGGESTIONS) {
      const extra = getRandomGeneralSuggestions(
        uiLang,
        MAX_SUGGESTIONS - specificSuggestions.length
      );
      finalSuggestions = [...specificSuggestions, ...extra];
    }

    setSmeResult({
      text: baseText,
      suggestions: finalSuggestions,
      error: "",
    });
  };

  /* ========== MICRO EVENTS ========== */

  const calculateMicro = () => {
    if (!micro.eventName.trim()) {
      setMicroResult({
        text: "",
        suggestions: [],
        error: t(
          "carbon.errors.microEventNameRequired",
          "Please enter an event name for the Micro Gathering."
        ),
      });
      return;
    }

    const attendees = toNum(micro.attendees);
    const avgTravel = toNum(micro.avgTravelKm);
    const mealsPer = toNum(micro.mealsPerAttendee);

    if (attendees < 0 || avgTravel < 0 || mealsPer < 0) {
      setMicroResult({
        text: "",
        suggestions: [],
        error: t(
          "carbon.errors.microInvalidInput",
          "Please enter valid non-negative numbers for all micro event inputs."
        ),
      });
      return;
    }

    const travel =
      attendees * avgTravel * FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR;
    const meals = attendees * mealsPer * FIXED_EVENT_MEAL_FACTOR;
    const total = travel + meals;

    if (total <= 0) {
      setMicroResult({
        text: "",
        suggestions: [],
        error: t(
          "carbon.errors.microZeroValues",
          "Please provide non-zero attendee/travel/meal values to calculate micro event emissions."
        ),
      });
      return;
    }

    const baseText = `${totalLabel}: ${fmtKgT(total)}`;

    const eventSuggestions = [
      `<strong>${t(
        "carbon.eventLabel",
        "Event"
      )}: ${micro.eventName.trim()}</strong>`,
      ...(EVENT_SUGGESTIONS[uiLang] || EVENT_SUGGESTIONS.en),
    ];

    setMicroResult({
      text: baseText,
      suggestions: eventSuggestions,
      error: "",
    });
  };

  /* ========== MACRO / INDOOR GATHERINGS ========== */

  const calculateMacro = () => {
    if (!macro.eventName.trim()) {
      setMacroResult({
        text: "",
        suggestions: [],
        error: t(
          "carbon.errors.macroEventNameRequired",
          "Please enter an event name for the Macro Gathering."
        ),
      });
      return;
    }

    const attendees = toNum(macro.attendees);
    const avgTravel = toNum(macro.avgTravelKm);
    const mealsPer = toNum(macro.mealsPerAttendee);
    const durationHours = toNum(macro.durationHours);
    const electricityKWh = toNum(macro.electricityKWh);
    const naturalGasM3 = toNum(macro.naturalGasM3);
    const waterLiters = toNum(macro.waterLiters);
    const landfilledWasteKg = toNum(macro.landfilledWasteKg);
    const recycledWasteKg = toNum(macro.recycledWasteKg);
    const compostedWasteKg = toNum(macro.compostedWasteKg);

    if (
      attendees < 0 ||
      avgTravel < 0 ||
      mealsPer < 0 ||
      durationHours < 0 ||
      electricityKWh < 0 ||
      naturalGasM3 < 0 ||
      waterLiters < 0 ||
      landfilledWasteKg < 0 ||
      recycledWasteKg < 0 ||
      compostedWasteKg < 0
    ) {
      setMacroResult({
        text: "",
        suggestions: [],
        error: t(
          "carbon.errors.macroInvalidInput",
          "Please enter valid non-negative numbers for all Macro Gathering inputs."
        ),
      });
      return;
    }

    const travel =
      attendees * avgTravel * FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR;
    const meals = attendees * mealsPer * FIXED_EVENT_MEAL_FACTOR;
    const elec = electricityKWh * FIXED_ELECTRICITY_EMISSION_FACTOR;
    const gas = naturalGasM3 * FIXED_NATURAL_GAS_EMISSION_FACTOR;
    const water = waterLiters * FIXED_BUILDING_WATER_EMISSION_FACTOR;
    const landfilled =
      landfilledWasteKg * FIXED_LANDFILLED_WASTE_EMISSION_FACTOR;
    const recycled =
      recycledWasteKg * FIXED_RECYCLED_WASTE_EMISSION_FACTOR;
    const composted =
      compostedWasteKg * FIXED_COMPOSTED_WASTE_EMISSION_FACTOR;

    const total =
      travel +
      meals +
      elec +
      gas +
      water +
      landfilled +
      recycled +
      composted;

    if (total <= 0) {
      setMacroResult({
        text: "",
        suggestions: [],
        error: t(
          "carbon.errors.macroZeroValues",
          "Please provide non-zero values to calculate Macro Gathering emissions."
        ),
      });
      return;
    }

    const baseText = `${totalLabel}: ${fmtKgT(total)}`;

    const suggestions = [
      `<strong>${t(
        "carbon.eventLabel",
        "Event"
      )}: ${macro.eventName.trim()}</strong>`,
      ...(INDOOR_GATHERING_SUGGESTIONS[uiLang] ||
        INDOOR_GATHERING_SUGGESTIONS.en),
    ];

    setMacroResult({
      text: baseText,
      suggestions,
      error: "",
    });
  };

  /* ========== OTHER CALCULATORS ========== */

  const setOtherResultWithSuggestions = (total, category) => {
    if (total <= 0) {
      setOtherResult({
        text: "",
        suggestions: [],
        error: t(
          "carbon.errors.otherZeroValues",
          "Please enter a valid non-negative value to calculate emissions."
        ),
      });
      return;
    }

    const baseText = `${totalLabel}: ${fmtKgT(total)}`;

    let specific;
    switch (category) {
      case "flights":
        specific = FLIGHT_SUGGESTIONS[uiLang] || FLIGHT_SUGGESTIONS.en;
        break;
      case "vehicles":
        specific = VEHICLE_SUGGESTIONS[uiLang] || VEHICLE_SUGGESTIONS.en;
        break;
      case "vessels":
        specific = VESSEL_SUGGESTIONS[uiLang] || VESSEL_SUGGESTIONS.en;
        break;
      case "publicTransport":
        specific =
          PUBLIC_TRANSPORT_SUGGESTIONS[uiLang] ||
          PUBLIC_TRANSPORT_SUGGESTIONS.en;
        break;
      case "freight":
        specific = FREIGHT_SUGGESTIONS[uiLang] || FREIGHT_SUGGESTIONS.en;
        break;
      case "water":
        specific = WATER_SUGGESTIONS[uiLang] || WATER_SUGGESTIONS.en;
        break;
      case "waste":
        specific = WASTE_SUGGESTIONS[uiLang] || WASTE_SUGGESTIONS.en;
        break;
      case "commuting":
        specific =
          COMMUTING_SUGGESTIONS[uiLang] || COMMUTING_SUGGESTIONS.en;
        break;
      default:
        specific = [];
    }

    const MAX_SUGGESTIONS = 12;
    let finalSuggestions = specific;
    if (specific.length > MAX_SUGGESTIONS) {
      finalSuggestions = specific.slice(0, MAX_SUGGESTIONS);
    } else if (specific.length < MAX_SUGGESTIONS) {
      const extra = getRandomGeneralSuggestions(
        uiLang,
        MAX_SUGGESTIONS - specific.length
      );
      finalSuggestions = [...specific, ...extra];
    }

    setOtherResult({
      text: baseText,
      suggestions: finalSuggestions,
      error: "",
    });
  };

  const calculateFlights = () => {
    const factor = FLIGHT_FACTORS[other.flightsType] || 0;
    const total = toNum(other.flightsDistance) * factor;
    setOtherResultWithSuggestions(total, "flights");
  };

  const calculateVehicle = () => {
    const factor = VEHICLE_FACTORS[other.vehicleType] || 0;
    const total = toNum(other.vehicleDistance) * factor;
    setOtherResultWithSuggestions(total, "vehicles");
  };

  const calculateVessel = () => {
    const factor = VESSEL_FACTORS[other.vesselType] || 0;
    const total = toNum(other.vesselDistance) * factor;
    setOtherResultWithSuggestions(total, "vessels");
  };

  const calculatePublicTransport = () => {
    const total =
      toNum(other.publicTransportDistance) *
      FIXED_PUBLIC_TRANSPORT_EMISSION_FACTOR;
    setOtherResultWithSuggestions(total, "publicTransport");
  };

  const calculateFreight = () => {
    const total =
      toNum(other.freightWeight) *
      FIXED_FREIGHT_BLENDED_EMISSION_FACTOR_PER_TONNE;
    setOtherResultWithSuggestions(total, "freight");
  };

  const calculateWater = () => {
    const total =
      toNum(other.waterConsumed) * FIXED_WATER_BLENDED_EMISSION_FACTOR;
    setOtherResultWithSuggestions(total, "water");
  };

  const calculateWaste = () => {
    const total =
      toNum(other.totalWaste) * FIXED_WASTE_BLENDED_EMISSION_FACTOR;
    setOtherResultWithSuggestions(total, "waste");
  };

  const calculateCommuting = () => {
    const perDay =
      toNum(other.commuteDistance) *
      2 *
      FIXED_COMMUTE_BLENDED_EMISSION_FACTOR;
    const total = perDay * FIXED_COMMUTE_DAYS_PER_YEAR;
    setOtherResultWithSuggestions(total, "commuting");
  };

  /* ================== TAB META ================== */

  const TAB_KEYS = ["sme", "micro", "macro", "other"];

  const getTabLabel = (key) => {
    switch (key) {
      case "sme":
        return t("carbon.tabs.sme", "SME's");
      case "micro":
        return t(
          "carbon.tabs.micro",
          "Micro Gatherings"
        );
      case "macro":
        return t(
          "carbon.tabs.macro",
          "Macro Gatherings"
        );
      case "other":
        return t(
          "carbon.tabs.other",
          "Other Calculators"
        );
      default:
        return key;
    }
  };
const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
const printRef = useRef(null);
const generatePDF = async () => {
  const element = printRef.current;
  const input = document.getElementById("printSection");
  
  if (!input || isGeneratingPdf || !element) return;
   
      element.scrollIntoView({ behavior: 'instant' });

  setIsGeneratingPdf(true);

  try { 
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    
    const pdf = new jsPDF("p", "pt", "a5");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    
    
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvas = await html2canvas(input, {
      scale: 1,
      useCORS: true,
      scrollY: -window.scrollY,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
       foreignObjectRendering: true,
    }); 

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save("Carbon-Calculator-Report.pdf");
  } catch (err) {
    console.error("PDF generation failed:", err);
  } finally {
    setIsGeneratingPdf(false);
  }
};
  /* ================== RENDER ================== */

  return (
    <div
      style={{
        background: "#f7fcf8",
        minHeight: "100vh", 
      }}
       id="printSection"
       ref={printRef}
    >
      {/* Logo */}
      {/* <div style={{ textAlign: "center", marginBottom: 20 }}>
        <img
          id="companyLogo"
          src="co2portal01.png"
          alt="Company Logo"
          style={{
            maxWidth: 250,
            height: "auto",
            display: "block",
            margin: "0 auto",
          }}
        />
      </div> */}

      <h1>
        {t(
          "carbon.appTitle",
          "Carbon Emissions Calculator"
        )}
      </h1>
      <p className="subtitle">
        {t(
          "carbon.subtitle",
          "Sustainable Success through Carbon Emissions awareness and Climate impact in your organization..."
        )}
      </p>

      {/* Language + Print */}
      <div className="button-container">
        <select
          className="language-select"
          value={uiLang}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="en">🇬🇧 English</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="es">🇪🇸 Español</option>
        </select>
        <button
  className="print-button"
  onClick={generatePDF}
  disabled={isGeneratingPdf}
>
  {isGeneratingPdf ? (
    <>
      <span className="spinner" />
      {t("carbon.generatingPdf", "Generating PDF...")}
    </>
  ) : (
    t("carbon.print", "📄 Print Report / Save as PDF")
  )}
</button>
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <div className="tab-navigation">
          {TAB_KEYS.map((key) => (
            <button
              key={key}
              className={`tab-button ${
                activeTab === key ? "active" : ""
              }`}
              onClick={() => setActiveTab(key)}
            >
              {getTabLabel(key)}
            </button>
          ))}
        </div>
      </div>

      {/* SME TAB */}
      <div
        id="tab-sme"
        className={`tab-content ${
          activeTab === "sme" ? "active" : ""
        }`}
        data-print-active={activeTab === "sme"}
      >
        <div className="calculator-container">
          <div
            className="calculation-section"
            style={{ gridColumn: "1 / -1" }}
          >
            <h2>
              {t(
                "carbon.sme.title",
                "SME Monthly/Annual CO2e Calculator"
              )}
            </h2>

            <label htmlFor="smeCompanyName">
              {t(
                "carbon.sme.companyName",
                "Company Name: *"
              )}
            </label>
            <input
              id="smeCompanyName"
              className="name-field"
              value={sme.companyName}
              onChange={(e) =>
                setSme({
                  ...sme,
                  companyName: e.target.value,
                })
              }
              placeholder={t(
                "carbon.sme.companyPlaceholder",
                "Enter your company name"
              )}
            />

            <label htmlFor="smeContact">
              {t(
                "carbon.sme.contactName",
                "Contact Name:"
              )}
            </label>
            <input
              id="smeContact"
              value={sme.contact}
              onChange={(e) =>
                setSme({
                  ...sme,
                  contact: e.target.value,
                })
              }
              placeholder="e.g., John Smith"
            />

            <label htmlFor="smeEmail">
              {t("carbon.sme.email", "Email:")}
            </label>
            <input
              id="smeEmail"
              value={sme.email}
              onChange={(e) =>
                setSme({ ...sme, email: e.target.value })
              }
              placeholder="e.g., contact@company.com"
            />

            <label htmlFor="smePhone">
              {t("carbon.sme.phone", "Phone Number:")}
            </label>
            <input
              id="smePhone"
              value={sme.phone}
              onChange={(e) =>
                setSme({ ...sme, phone: e.target.value })
              }
              placeholder="e.g., +1 234-567-8900"
            />

            <label htmlFor="smeStartDate">
              {t(
                "carbon.sme.startDate",
                "Reporting Period (Start Date):"
              )}
            </label>
            <input
              id="smeStartDate"
              type="date"
              value={sme.startDate}
              onChange={(e) =>
                setSme({
                  ...sme,
                  startDate: e.target.value,
                })
              }
            />

            <label htmlFor="smeEndDate">
              {t(
                "carbon.sme.endDate",
                "Reporting Period (End Date):"
              )}
            </label>
            <input
              id="smeEndDate"
              type="date"
              value={sme.endDate}
              onChange={(e) =>
                setSme({
                  ...sme,
                  endDate: e.target.value,
                })
              }
            />

            <label htmlFor="smeIndustry">
              {t(
                "carbon.sme.industry",
                "Business Industry/Sector:"
              )}
            </label>
            <input
              id="smeIndustry"
              value={sme.industry}
              onChange={(e) =>
                setSme({
                  ...sme,
                  industry: e.target.value,
                })
              }
              placeholder="e.g., Retail, IT Services"
            />

            <label htmlFor="smeEmployees">
              {t(
                "carbon.sme.employees",
                "Number of Employees:"
              )}
            </label>
            <input
              id="smeEmployees"
              type="number"
              value={sme.employees}
              onChange={(e) =>
                setSme({
                  ...sme,
                  employees: e.target.value,
                })
              }
              placeholder="e.g., 25"
            />

            <label htmlFor="smeBuildingArea">
              {t(
                "carbon.sme.buildingArea",
                "Total Building Area (sq meters):"
              )}
            </label>
            <input
              id="smeBuildingArea"
              type="number"
              value={sme.buildingArea}
              onChange={(e) =>
                setSme({
                  ...sme,
                  buildingArea: e.target.value,
                })
              }
              placeholder="e.g., 500"
            />

            <label htmlFor="smeElectricityKWh">
              {t(
                "carbon.sme.electricityKWh",
                "Electricity Consumption (kWh):"
              )}
            </label>
            <input
              id="smeElectricityKWh"
              type="number"
              value={sme.electricityKWh}
              onChange={(e) =>
                setSme({
                  ...sme,
                  electricityKWh: e.target.value,
                })
              }
              placeholder="e.g., 10000"
            />

            <label htmlFor="smeNaturalGasM3">
              {t(
                "carbon.sme.naturalGasM3",
                "Natural Gas Consumption (m³):"
              )}
            </label>
            <input
              id="smeNaturalGasM3"
              type="number"
              value={sme.naturalGasM3}
              onChange={(e) =>
                setSme({
                  ...sme,
                  naturalGasM3: e.target.value,
                })
              }
              placeholder="e.g., 500"
            />

            <label htmlFor="smeGasolineLiters">
              {t(
                "carbon.sme.gasolineL",
                "Gasoline Consumption (Liters):"
              )}
            </label>
            <input
              id="smeGasolineLiters"
              type="number"
              value={sme.gasolineLiters}
              onChange={(e) =>
                setSme({
                  ...sme,
                  gasolineLiters: e.target.value,
                })
              }
              placeholder="e.g., 1000"
            />

            <label htmlFor="smeDieselLiters">
              {t(
                "carbon.sme.dieselL",
                "Diesel Consumption (Liters):"
              )}
            </label>
            <input
              id="smeDieselLiters"
              type="number"
              value={sme.dieselLiters}
              onChange={(e) =>
                setSme({
                  ...sme,
                  dieselLiters: e.target.value,
                })
              }
              placeholder="e.g., 500"
            />

            <button
              className="calc-button"
              onClick={calculateSME}
            >
              {t(
                "carbon.sme.calc",
                "Calculate SME CO2e"
              )}
            </button>
          </div>

          <div
            id="result-sme"
            className={`result ${smeResult.error ? "error" : ""}`}
          >
            {smeResult.error ? (
              <p>{smeResult.error}</p>
            ) : (
              <>
                <p>
                  {smeResult.text || resultPlaceholder}
                </p>
                {smeResult.suggestions.length > 0 && (
                  <ul>
                    {smeResult.suggestions.map(
                      (s, idx) => (
                        <li
                          key={idx}
                          dangerouslySetInnerHTML={{
                            __html: s,
                          }}
                        />
                      )
                    )}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* MICRO TAB */}
      <div
        id="tab-micro"
        className={`tab-content ${
          activeTab === "micro" ? "active" : ""
        }`}
        data-print-active={activeTab === "micro"}
      >
        <div className="calculator-container">
          <div
            className="calculation-section"
            style={{ gridColumn: "1 / -1" }}
          >
            <h2>
              {t(
                "carbon.micro.title",
                "Micro Gatherings & Events"
              )}
            </h2>
            <p>
              {t(
                "carbon.micro.sub",
                "(Small Weddings, Hotel Salons, Churches, Schools, Universities, Theaters, Pools)"
              )}
            </p>

            <label htmlFor="microEventName">
              {t("carbon.micro.eventName", "Event Name: *")}
            </label>
            <input
              id="microEventName"
              className="name-field"
              value={micro.eventName}
              onChange={(e) =>
                setMicro({
                  ...micro,
                  eventName: e.target.value,
                })
              }
              placeholder={t(
                "carbon.micro.eventPlaceholder",
                "Enter event name"
              )}
            />

            <label htmlFor="microContact">
              {t(
                "carbon.micro.contactName",
                "Contact Name:"
              )}
            </label>
            <input
              id="microContact"
              value={micro.contact}
              onChange={(e) =>
                setMicro({
                  ...micro,
                  contact: e.target.value,
                })
              }
              placeholder="e.g., Jane Doe"
            />

            <label htmlFor="microEmail">
              {t("carbon.micro.email", "Email:")}
            </label>
            <input
              id="microEmail"
              value={micro.email}
              onChange={(e) =>
                setMicro({
                  ...micro,
                  email: e.target.value,
                })
              }
              placeholder="e.g., event@organizer.com"
            />

            <label htmlFor="microPhone">
              {t("carbon.micro.phone", "Phone Number:")}
            </label>
            <input
              id="microPhone"
              value={micro.phone}
              onChange={(e) =>
                setMicro({
                  ...micro,
                  phone: e.target.value,
                })
              }
              placeholder="e.g., +1 234-567-8900"
            />

            <label htmlFor="eventAttendees">
              {t(
                "carbon.micro.attendeesLT50",
                "Number of Attendees (<50):"
              )}
            </label>
            <input
              id="eventAttendees"
              type="number"
              value={micro.attendees}
              onChange={(e) =>
                setMicro({
                  ...micro,
                  attendees: e.target.value,
                })
              }
              placeholder="e.g., 45"
            />

            <label htmlFor="eventAvgTravelDistance">
              {t(
                "carbon.micro.avgTravelKm",
                "Avg. Travel Distance per Attendee (km round trip):"
              )}
            </label>
            <input
              id="eventAvgTravelDistance"
              type="number"
              value={micro.avgTravelKm}
              onChange={(e) =>
                setMicro({
                  ...micro,
                  avgTravelKm: e.target.value,
                })
              }
              placeholder="e.g., 20"
            />

            <label htmlFor="eventMealsPerAttendee">
              {t(
                "carbon.micro.mealsPerAttendee",
                "Meals Served per Attendee:"
              )}
            </label>
            <input
              id="eventMealsPerAttendee"
              type="number"
              value={micro.mealsPerAttendee}
              onChange={(e) =>
                setMicro({
                  ...micro,
                  mealsPerAttendee: e.target.value,
                })
              }
              placeholder="e.g., 1 (enter 0 if no meals)"
            />

            <label htmlFor="eventDurationHours">
              {t(
                "carbon.micro.durationHrs",
                "Event Duration (hours):"
              )}
            </label>
            <input
              id="eventDurationHours"
              type="number"
              value={micro.durationHours}
              onChange={(e) =>
                setMicro({
                  ...micro,
                  durationHours: e.target.value,
                })
              }
              placeholder="e.g., 4"
            />

            <button
              className="calc-button"
              onClick={calculateMicro}
            >
              {t(
                "carbon.micro.calc",
                "Calculate Micro Event CO2e"
              )}
            </button>
          </div>

          <div
            id="result-micro"
            className={`result ${microResult.error ? "error" : ""}`}
          >
            {microResult.error ? (
              <p>{microResult.error}</p>
            ) : (
              <>
                <p>
                  {microResult.text || resultPlaceholder}
                </p>
                {microResult.suggestions.length > 0 && (
                  <ul>
                    {microResult.suggestions.map(
                      (s, idx) => (
                        <li
                          key={idx}
                          dangerouslySetInnerHTML={{
                            __html: s,
                          }}
                        />
                      )
                    )}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* MACRO TAB */}
      <div
        id="tab-macro"
        className={`tab-content ${
          activeTab === "macro" ? "active" : ""
        }`}
        data-print-active={activeTab === "macro"}
      >
        <div className="calculator-container">
          <div
            className="calculation-section"
            style={{ gridColumn: "1 / -1" }}
          >
            <h2>
              {t(
                "carbon.macro.title",
                "Macro Gatherings & Events"
              )}
            </h2>
            <p>
              {t(
                "carbon.macro.sub",
                "(Wedding Halls, Hotel Salons, Churches, Schools, Universities, Theaters, Pools)"
              )}
            </p>

            <label htmlFor="macroEventName">
              {t("carbon.macro.eventName", "Event Name: *")}
            </label>
            <input
              id="macroEventName"
              className="name-field"
              value={macro.eventName}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  eventName: e.target.value,
                })
              }
              placeholder={t(
                "carbon.macro.eventPlaceholder",
                "Enter event name"
              )}
            />

            <label htmlFor="macroContact">
              {t(
                "carbon.macro.contactName",
                "Contact Name:"
              )}
            </label>
            <input
              id="macroContact"
              value={macro.contact}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  contact: e.target.value,
                })
              }
              placeholder="e.g., Jane Doe"
            />

            <label htmlFor="macroEmail">
              {t("carbon.macro.email", "Email:")}
            </label>
            <input
              id="macroEmail"
              value={macro.email}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  email: e.target.value,
                })
              }
              placeholder="e.g., event@organizer.com"
            />

            <label htmlFor="macroPhone">
              {t("carbon.macro.phone", "Phone Number:")}
            </label>
            <input
              id="macroPhone"
              value={macro.phone}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  phone: e.target.value,
                })
              }
              placeholder="e.g., +1 234-567-8900"
            />

            <label htmlFor="buildingAttendees">
              {t(
                "carbon.macro.attendeesGT50",
                "Number of Attendees (>50):"
              )}
            </label>
            <input
              id="buildingAttendees"
              type="number"
              value={macro.attendees}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  attendees: e.target.value,
                })
              }
              placeholder="e.g., 500"
            />

            <label htmlFor="buildingAvgTravelDistance">
              {t(
                "carbon.macro.avgAttendeeTravelKm",
                "Avg. Attendee Travel Distance (km round trip):"
              )}
            </label>
            <input
              id="buildingAvgTravelDistance"
              type="number"
              value={macro.avgTravelKm}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  avgTravelKm: e.target.value,
                })
              }
              placeholder="e.g., 10"
            />

            <label htmlFor="buildingMealsPerAttendee">
              {t(
                "carbon.macro.mealsPerAttendeeMacro",
                "Meals Served per Attendee:"
              )}
            </label>
            <input
              id="buildingMealsPerAttendee"
              type="number"
              value={macro.mealsPerAttendee}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  mealsPerAttendee: e.target.value,
                })
              }
              placeholder="e.g., 0.5 (enter 0 if no meals)"
            />

            <label htmlFor="buildingDurationHours">
              {t(
                "carbon.macro.durationHrsMacro",
                "Event/Gathering Duration (hours):"
              )}
            </label>
            <input
              id="buildingDurationHours"
              type="number"
              value={macro.durationHours}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  durationHours: e.target.value,
                })
              }
              placeholder="e.g., 2"
            />

            <hr />

            <label htmlFor="buildingElectricityKWh">
              {t(
                "carbon.macro.electricityConsumed",
                "Electricity Consumed (kWh):"
              )}
            </label>
            <input
              id="buildingElectricityKWh"
              type="number"
              value={macro.electricityKWh}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  electricityKWh: e.target.value,
                })
              }
              placeholder="e.g., 150"
            />

            <label htmlFor="buildingNaturalGasM3">
              {t(
                "carbon.macro.naturalGasConsumed",
                "Natural Gas Consumed (m³):"
              )}
            </label>
            <input
              id="buildingNaturalGasM3"
              type="number"
              value={macro.naturalGasM3}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  naturalGasM3: e.target.value,
                })
              }
              placeholder="e.g., 20"
            />

            <label htmlFor="buildingWaterLiters">
              {t(
                "carbon.macro.waterLiters",
                "Water Consumed (Liters):"
              )}
            </label>
            <input
              id="buildingWaterLiters"
              type="number"
              value={macro.waterLiters}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  waterLiters: e.target.value,
                })
              }
              placeholder="e.g., 500"
            />

            <label htmlFor="buildingLandfilledWasteKg">
              {t(
                "carbon.macro.landfilledKg",
                "Landfilled Waste (kg):"
              )}
            </label>
            <input
              id="buildingLandfilledWasteKg"
              type="number"
              value={macro.landfilledWasteKg}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  landfilledWasteKg: e.target.value,
                })
              }
              placeholder="e.g., 10"
            />

            <label htmlFor="buildingRecycledWasteKg">
              {t(
                "carbon.macro.recycledKg",
                "Recycled Waste (kg):"
              )}
            </label>
            <input
              id="buildingRecycledWasteKg"
              type="number"
              value={macro.recycledWasteKg}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  recycledWasteKg: e.target.value,
                })
              }
              placeholder="e.g., 5"
            />

            <label htmlFor="buildingCompostedWasteKg">
              {t(
                "carbon.macro.compostedKg",
                "Composted Waste (kg):"
              )}
            </label>
            <input
              id="buildingCompostedWasteKg"
              type="number"
              value={macro.compostedWasteKg}
              onChange={(e) =>
                setMacro({
                  ...macro,
                  compostedWasteKg: e.target.value,
                })
              }
              placeholder="e.g., 2"
            />

            <button
              className="calc-button"
              onClick={calculateMacro}
            >
              {t(
                "carbon.macro.calc",
                "Calculate Macro Gathering CO2e"
              )}
            </button>
          </div>

          <div
            id="result-macro"
            className={`result ${macroResult.error ? "error" : ""}`}
          >
            {macroResult.error ? (
              <p>{macroResult.error}</p>
            ) : (
              <>
                <p>
                  {macroResult.text || resultPlaceholder}
                </p>
                {macroResult.suggestions.length > 0 && (
                  <ul>
                    {macroResult.suggestions.map(
                      (s, idx) => (
                        <li
                          key={idx}
                          dangerouslySetInnerHTML={{
                            __html: s,
                          }}
                        />
                      )
                    )}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* OTHER TAB */}
      <div
        id="tab-other"
        className={`tab-content ${
          activeTab === "other" ? "active" : ""
        }`}
        data-print-active={activeTab === "other"}
      >
        <div className="calculator-container">
          <div className="calculation-section">
            <label htmlFor="flightsType">
              {t("carbon.other.flights", "FLIGHTS:")}
            </label>
            <select
              id="flightsType"
              value={other.flightsType}
              onChange={(e) =>
                setOther({
                  ...other,
                  flightsType: e.target.value,
                })
              }
            >
              <option value="recreational_aircraft">
                {t(
                  "carbon.other.recreationalAircraft",
                  "Recreational Aircraft"
                )}
              </option>
              <option value="commercial_aircraft">
                {t(
                  "carbon.other.commercialAircraft",
                  "Commercial Aircraft"
                )}
              </option>
              <option value="amphibious_aircraft">
                {t(
                  "carbon.other.amphibiousAircraft",
                  "Amphibious Aircraft"
                )}
              </option>
              <option value="helicopter">
                {t("carbon.other.helicopter", "Helicopter")}
              </option>
            </select>
            <label htmlFor="flightsDistance">
              {t(
                "carbon.other.flightDistance",
                "Flight Distance (km):"
              )}
            </label>
            <input
              id="flightsDistance"
              type="number"
              value={other.flightsDistance}
              onChange={(e) =>
                setOther({
                  ...other,
                  flightsDistance: e.target.value,
                })
              }
              placeholder="e.g., 500"
            />
            <button
              className="calc-button"
              onClick={calculateFlights}
            >
              {t(
                "carbon.other.calcFlight",
                "Calculate Flight CO2e"
              )}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="vehicleType">
              {t("carbon.other.vehicles", "VEHICLES:")}
            </label>
            <select
              id="vehicleType"
              value={other.vehicleType}
              onChange={(e) =>
                setOther({
                  ...other,
                  vehicleType: e.target.value,
                })
              }
            >
              <option value="sedan">
                {t("carbon.other.sedan", "Sedan")}
              </option>
              <option value="van">
                {t("carbon.other.van", "Van")}
              </option>
              <option value="suv_4x4">
                {t("carbon.other.suv4x4", "SUV / 4x4")}
              </option>
              <option value="truck">
                {t("carbon.other.truck", "Truck")}
              </option>
            </select>
            <label htmlFor="vehicleDistance">
              {t(
                "carbon.other.vehicleDistance",
                "Distance Traveled (km):"
              )}
            </label>
            <input
              id="vehicleDistance"
              type="number"
              value={other.vehicleDistance}
              onChange={(e) =>
                setOther({
                  ...other,
                  vehicleDistance: e.target.value,
                })
              }
              placeholder="e.g., 100"
            />
            <button
              className="calc-button"
              onClick={calculateVehicle}
            >
              {t(
                "carbon.other.calcVehicle",
                "Calculate Vehicle CO2e"
              )}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="vesselType">
              {t("carbon.other.vessels", "VESSELS:")}
            </label>
            <select
              id="vesselType"
              value={other.vesselType}
              onChange={(e) =>
                setOther({
                  ...other,
                  vesselType: e.target.value,
                })
              }
            >
              <option value="motor_boat_gasoline">
                {t(
                  "carbon.other.motorBoatGasoline",
                  "Motor Boat (Gasoline)"
                )}
              </option>
              <option value="motor_boat_diesel">
                {t(
                  "carbon.other.motorBoatDiesel",
                  "Motor Boat (Diesel)"
                )}
              </option>
              <option value="electric_sail_boat">
                {t(
                  "carbon.other.electricSailBoat",
                  "Electric/Sail Boat"
                )}
              </option>
              <option value="yacht_gasoline">
                {t(
                  "carbon.other.yachtGasoline",
                  "Yacht (Gasoline)"
                )}
              </option>
              <option value="yacht_diesel">
                {t(
                  "carbon.other.yachtDiesel",
                  "Yacht (Diesel)"
                )}
              </option>
              <option value="yacht_electric">
                {t(
                  "carbon.other.yachtElectric",
                  "Yacht (Electric)"
                )}
              </option>
            </select>
            <label htmlFor="vesselDistance">
              {t(
                "carbon.other.vesselDistance",
                "Distance Traveled (km):"
              )}
            </label>
            <input
              id="vesselDistance"
              type="number"
              value={other.vesselDistance}
              onChange={(e) =>
                setOther({
                  ...other,
                  vesselDistance: e.target.value,
                })
              }
              placeholder="e.g., 50"
            />
            <button
              className="calc-button"
              onClick={calculateVessel}
            >
              {t(
                "carbon.other.calcVessel",
                "Calculate Vessel CO2e"
              )}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="publicTransportDistance">
              {t(
                "carbon.other.publicTransportKm",
                "Public Transport (km):"
              )}
            </label>
            <input
              id="publicTransportDistance"
              type="number"
              value={other.publicTransportDistance}
              onChange={(e) =>
                setOther({
                  ...other,
                  publicTransportDistance: e.target.value,
                })
              }
              placeholder="e.g., 50"
            />
            <button
              className="calc-button"
              onClick={calculatePublicTransport}
            >
              {t(
                "carbon.other.calcPublicTransport",
                "Public Transport CO2e"
              )}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="freightWeight">
              {t(
                "carbon.other.freightTonnes",
                "Freight Weight (tonnes):"
              )}
            </label>
            <input
              id="freightWeight"
              type="number"
              value={other.freightWeight}
              onChange={(e) =>
                setOther({
                  ...other,
                  freightWeight: e.target.value,
                })
              }
              placeholder="e.g., 10"
            />
            <button
              className="calc-button"
              onClick={calculateFreight}
            >
              {t(
                "carbon.other.calcFreight",
                "Calculate Freight CO2e"
              )}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="waterConsumed">
              {t(
                "carbon.other.waterConsumed",
                "Water Consumed (Liters):"
              )}
            </label>
            <input
              id="waterConsumed"
              type="number"
              value={other.waterConsumed}
              onChange={(e) =>
                setOther({
                  ...other,
                  waterConsumed: e.target.value,
                })
              }
              placeholder="e.g., 1000"
            />
            <button
              className="calc-button"
              onClick={calculateWater}
            >
              {t(
                "carbon.other.calcWater",
                "Calculate Water CO2e"
              )}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="totalWaste">
              {t(
                "carbon.other.totalWaste",
                "Total Waste (kg):"
              )}
            </label>
            <input
              id="totalWaste"
              type="number"
              value={other.totalWaste}
              onChange={(e) =>
                setOther({
                  ...other,
                  totalWaste: e.target.value,
                })
              }
              placeholder="e.g., 50"
            />
            <button
              className="calc-button"
              onClick={calculateWaste}
            >
              {t(
                "carbon.other.calcWaste",
                "Calculate Waste CO2e"
              )}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="commuteDistance">
              {t(
                "carbon.other.commuteOneWayKm",
                "Commute (one-way, km):"
              )}
            </label>
            <input
              id="commuteDistance"
              type="number"
              value={other.commuteDistance}
              onChange={(e) =>
                setOther({
                  ...other,
                  commuteDistance: e.target.value,
                })
              }
              placeholder="e.g., 15"
            />
            <button
              className="calc-button"
              onClick={calculateCommuting}
            >
              {t(
                "carbon.other.calcCommute",
                "Commuting Travel CO2e"
              )}
            </button>
          </div>

          <div
            id="result-other"
            className={`result ${otherResult.error ? "error" : ""}`}
          >
            {otherResult.error ? (
              <p>{otherResult.error}</p>
            ) : (
              <>
                <p>
                  {otherResult.text || resultPlaceholder}
                </p>
                {otherResult.suggestions.length > 0 && (
                  <ul>
                    {otherResult.suggestions.map(
                      (s, idx) => (
                        <li
                          key={idx}
                          dangerouslySetInnerHTML={{
                            __html: s,
                          }}
                        />
                      )
                    )}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonEmissionsCalculator;
