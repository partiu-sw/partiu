// Partiu — dados de exemplo das cidades do litoral catarinense.
// Pontos reais conferidos no OpenStreetMap; restaurantes e hotéis são fictícios.
const CITIES = [
  { id: 'bc', name: 'Balneário Camboriú', places: [
    ['dormir', 'Hotel Orla Central', 'Hospedagem · Centro', '4,5', '$$', -26.9905, -48.6330],
    ['ver', 'Praia Central', 'Praia · Av. Atlântica', '4,7', 'Grátis', -26.9889, -48.6296],
    ['ver', 'Cristo Luz', 'Mirante · Nações', '4,6', '$', -26.9853, -48.6452],
    ['ver', 'Parque Unipraias', 'Bondinho · Barra Sul', '4,8', '$$$', -27.0052, -48.6034],
    ['comer', 'Cantina da Barra', 'Italiana · Barra Sul', '4,5', '$$', -27.0055, -48.6125],
    ['comer', 'Mar & Brasa', 'Frutos do mar · Pioneiros', '4,6', '$$$', -26.9700, -48.6370],
    ['comer', 'Café Atlântico', 'Café · Centro', '4,4', '$', -26.9930, -48.6315],
    ['ver', 'Praia de Laranjeiras', 'Praia · Interpraias', '4,7', 'Grátis', -26.9969, -48.5890],
    ['ver', 'Praia dos Amores', 'Praia · Norte', '4,7', 'Grátis', -26.9606, -48.6235],
    ['ver', 'Molhe da Barra Sul', 'Passeio · Barra Sul', '4,6', 'Grátis', -27.0085, -48.6168],
    ['ver', 'Praia do Estaleiro', 'Praia · Interpraias', '4,8', 'Grátis', -27.0378, -48.5862],
    ['comer', 'Sushi Maré da Barra', 'Japonesa · Barra Sul', '4,6', '$$$', -27.0040, -48.6140],
    ['comer', 'Padaria Atlântica', 'Café · Pioneiros', '4,5', '$', -26.9752, -48.6340],
    ['comer', 'Bistrô Pôr do Sol', 'Contemporânea · Centro', '4,7', '$$$', -26.9880, -48.6345],
    ['comer', 'Pizzaria Forno da Praia', 'Pizzaria · Centro', '4,6', '$$', -26.9915, -48.6352],
    ['comer', 'Sorveteria Gelato Mar', 'Sorveteria · Av. Atlântica', '4,8', '$', -26.9862, -48.6305],
    ['comer', 'Burger da Orla', 'Hambúrguer · Pioneiros', '4,5', '$$', -26.9790, -48.6355],
    ['ver', 'Praia de Taquaras', 'Praia · Interpraias', '4,8', 'Grátis', -27.0170, -48.5835],
    ['ver', 'Parque Ecológico Rio Camboriú', 'Natureza · trilha', '4,5', 'Grátis', -26.9990, -48.6480]
  ]},
  { id: 'itapema', name: 'Itapema', places: [
    ['dormir', 'Pousada Meia Praia', 'Hospedagem · Meia Praia', '4,6', '$$', -27.1240, -48.6045],
    ['ver', 'Meia Praia', 'Praia · Orla', '4,7', 'Grátis', -27.1260, -48.6018],
    ['ver', 'Praia Central', 'Praia · Centro', '4,5', 'Grátis', -27.1015, -48.6137],
    ['ver', 'Praia Grossa', 'Praia · Trilha', '4,8', 'Grátis', -27.0864, -48.5963],
    ['comer', 'Peixaria do Canto', 'Frutos do mar · Centro', '4,6', '$$', -27.0990, -48.6150],
    ['comer', 'Bistrô Meia Praia', 'Contemporânea · Meia Praia', '4,5', '$$$', -27.1205, -48.6052],
    ['comer', 'Padaria da Orla', 'Café · Morretes', '4,4', '$', -27.1150, -48.6062],
    ['ver', 'Canto da Praia', 'Praia · Canto', '4,6', 'Grátis', -27.1310, -48.5960],
    ['ver', 'Praia do Plaza', 'Praia · Trilha', '4,6', 'Grátis', -27.0905, -48.6010],
    ['comer', 'Sorveteria do Canto', 'Café · Meia Praia', '4,6', '$', -27.1225, -48.6040],
    ['comer', 'Cantina Itapema', 'Italiana · Centro', '4,5', '$$', -27.1035, -48.6120],
    ['comer', 'Sushi Itapema Bay', 'Japonesa · Meia Praia', '4,6', '$$$', -27.1190, -48.6050],
    ['comer', 'Burger Canto', 'Hambúrguer · Canto', '4,4', '$$', -27.1290, -48.5985],
    ['ver', 'Mirante do Encanto', 'Mirante · trilha', '4,7', 'Grátis', -27.1100, -48.5940]
  ]},
  { id: 'portobelo', name: 'Porto Belo', places: [
    ['dormir', 'Pousada Enseada', 'Hospedagem · Centro', '4,6', '$$', -27.1570, -48.5500],
    ['ver', 'Ilha de Porto Belo', 'Passeio de barco', '4,8', '$$', -27.1402, -48.5436],
    ['ver', 'Igreja Bom Jesus dos Aflitos', 'Centro histórico', '4,6', 'Grátis', -27.1587, -48.5533],
    ['ver', 'Praia de Porto Belo', 'Praia · Centro', '4,5', 'Grátis', -27.1552, -48.5488],
    ['comer', 'Restaurante do Cais', 'Frutos do mar · Orla', '4,6', '$$', -27.1560, -48.5470],
    ['comer', 'Ostras da Baía', 'Ostras · Orla', '4,7', '$$$', -27.1540, -48.5450],
    ['ver', 'Praia do Araçá', 'Praia · Araçá', '4,7', 'Grátis', -27.1350, -48.5302],
    ['ver', 'Praia de Bombas', 'Praia · Bombinhas', '4,7', 'Grátis', -27.1385, -48.5150],
    ['ver', "Praia do Caixa d'Aço", 'Praia · Araçá', '4,8', 'Grátis', -27.1292, -48.5240],
    ['comer', 'Café da Enseada', 'Café · Centro', '4,5', '$', -27.1575, -48.5515],
    ['comer', 'Pizzaria Porto Antigo', 'Pizzaria · Centro', '4,5', '$$', -27.1580, -48.5525],
    ['ver', 'Praia do Estaleiro de Porto Belo', 'Praia · Perequê', '4,4', 'Grátis', -27.1680, -48.5690],
    ['ver', 'Passeio de golfinhos na baía', 'Passeio de barco', '4,8', '$$', -27.1500, -48.5420]
  ]},
  { id: 'tijucas', name: 'Tijucas', places: [
    ['dormir', 'Hotel Tijucas', 'Hospedagem · Centro', '4,4', '$', -27.2410, -48.6350],
    ['ver', 'Igreja São Sebastião', 'Igreja · Centro', '4,7', 'Grátis', -27.2426, -48.6335],
    ['ver', 'Margem do Rio Tijucas', 'Passeio · Centro', '4,5', 'Grátis', -27.2452, -48.6372],
    ['comer', 'Engenho do Sabor', 'Comida caseira · Centro', '4,6', '$', -27.2400, -48.6370],
    ['comer', 'Peixaria do Rio', 'Frutos do mar · Centro', '4,5', '$$', -27.2445, -48.6345],
    ['ver', 'Praia de Tijucas', 'Praia · Centro', '4,3', 'Grátis', -27.2330, -48.6200],
    ['ver', 'Casarão Bayer', 'História · Centro', '4,5', 'Grátis', -27.2430, -48.6355],
    ['comer', 'Café do Largo', 'Café · Centro', '4,6', '$', -27.2418, -48.6340],
    ['comer', 'Pizzaria Tijucas', 'Pizzaria · Centro', '4,4', '$', -27.2405, -48.6362],
    ['ver', 'Museu Histórico de Tijucas', 'História · Centro', '4,5', 'Grátis', -27.2422, -48.6328]
  ]}
].map((c) => ({ ...c, places: c.places.map((p, i) => ({ id: c.id + i, cat: p[0], name: p[1], sub: p[2], rating: p[3], price: p[4], ll: [p[5], p[6]] })) }));
