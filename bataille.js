export default {
  id: 'bataille',
  nom: 'Bataille',
  emoji: '🃏',
  type: 'cartes',
  joueursMin: 2,
  joueursMax: 4,
  description: 'Le classique ! Distribuez toutes les cartes et retournez-les une à une.',
  regles: `
    <h3>But du jeu</h3>
    <p>Remporter toutes les cartes du jeu.</p>
    <h3>Mise en place</h3>
    <p>Le jeu de 52 cartes est distribué équitablement entre les joueurs, faces cachées.</p>
    <h3>Déroulement</h3>
    <ol>
      <li>Chaque joueur retourne simultanément sa carte du dessus.</li>
      <li>La carte la plus haute remporte toutes les cartes jouées.</li>
      <li>En cas d'égalité : <strong>bataille !</strong> Chaque joueur place 3 cartes faces cachées, puis une 4e face visible. La plus haute de ces dernières gagne tout.</li>
    </ol>
    <h3>Valeurs des cartes</h3>
    <p>As (14) › Roi (13) › Dame (12) › Valet (11) › 10 › 9 › ... › 2</p>
    <h3>Fin de partie</h3>
    <p>Un joueur sans carte est éliminé. Le dernier en jeu a gagné.</p>
  `,
  scoreConfig: null, // score = nombre de cartes en main

  state: null,

  VALEURS: ['2','3','4','5','6','7','8','9','10','V','D','R','A'],
  COULEURS: ['♠','♥','♦','♣'],
  COULEURS_NOMS: { '♠':'pique','♥':'cœur','♦':'carreau','♣':'trèfle' },

  creerDeck() {
    const deck = [];
    for (const c of this.COULEURS) {
      for (let v=0; v<this.VALEURS.length; v++) {
        deck.push({ valeur: this.VALEURS[v], couleur: c, force: v+2, rouge: c==='♥'||c==='♦' });
      }
    }
    for (let i=deck.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [deck[i],deck[j]]=[deck[j],deck[i]];
    }
    return deck;
  },

  init(joueurs) {
    const deck = this.creerDeck();
    const nb = joueurs.length;
    const mains = joueurs.map((_,i) => deck.filter((_,idx) => idx%nb===i));
    this.state = {
      joueurs: joueurs.map((j,i) => ({ ...j, main: mains[i], cartesGagnees: [] })),
      cartesTable: [],    // cartes visibles ce tour
      cartesCachees: [],  // cartes cachées lors d'une bataille
      phase: 'jouer',     // 'jouer' | 'bataille' | 'resultat' | 'fin'
      message: '',
      tour: 1,
    };
    return this.state;
  },

  jouerTour(state) {
    const joueurActifs = state.joueurs.filter(j => j.main.length > 0);
    if (joueurActifs.length < 2) { state.phase='fin'; return {...state}; }
    state.cartesTable = joueurActifs.map(j => ({ joueurId: j.id, carte: j.main.shift() }));
    state.phase = 'resultat';
    state.tour++;
    // Trouver le gagnant
    const maxForce = Math.max(...state.cartesTable.map(c=>c.carte.force));
    const gagnants = state.cartesTable.filter(c=>c.carte.force===maxForce);
    if (gagnants.length === 1) {
      const gagnant = state.joueurs.find(j=>j.id===gagnants[0].joueurId);
      const cartes = [...state.cartesCachees, ...state.cartesTable.map(c=>c.carte)];
      // Mélanger et remettre en bas de la main
      for (let i=cartes.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [cartes[i],cartes[j]]=[cartes[j],cartes[i]]; }
      gagnant.main.push(...cartes);
      state.cartesCachees = [];
      state.message = `${gagnant.nom} remporte le pli !`;
    } else {
      state.phase = 'bataille';
      state.message = 'Bataille !';
      // Mettre les cartes égales en cartes cachées + 3 supplémentaires par joueur
      const cacheesNouv = state.cartesTable.map(c=>c.carte);
      for (const g of gagnants) {
        const j = state.joueurs.find(jj=>jj.id===g.joueurId);
        const extras = j.main.splice(0, Math.min(3, j.main.length));
        cacheesNouv.push(...extras);
      }
      state.cartesCachees = [...state.cartesCachees, ...cacheesNouv];
    }
    return { ...state };
  },

  continuer(state) {
    state.cartesTable = [];
    const joueurActifs = state.joueurs.filter(j => j.main.length > 0);
    if (joueurActifs.length < 2) state.phase = 'fin';
    else state.phase = 'jouer';
    return { ...state };
  },
};
