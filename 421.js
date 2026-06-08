export default {
  id: '421',
  nom: '4-2-1',
  emoji: '🎯',
  type: 'dés',
  joueursMin: 2,
  joueursMax: 8,
  description: 'Évitez d\'être le dernier avec des jetons. Le 4-2-1 est la pire main !',
  regles: `
    <h3>But du jeu</h3>
    <p>Ne plus avoir de jetons. Le joueur qui prend le dernier jeton a perdu.</p>
    <h3>Mise en place</h3>
    <p>Chaque joueur commence avec <strong>6 jetons</strong>. Un pot central est vide au départ.</p>
    <h3>Déroulement</h3>
    <ol>
      <li>Le joueur actif lance les 3 dés, jusqu'à 3 fois en gardant ce qu'il veut.</li>
      <li>La valeur finale est lue selon la hiérarchie des mains.</li>
      <li>Chaque joueur joue à son tour ; le plus mauvais score du tour perd des jetons.</li>
    </ol>
    <h3>Hiérarchie des mains (du meilleur au pire)</h3>
    <ol>
      <li><strong>4-2-1</strong> : la main ultime, bat tout.</li>
      <li><strong>111</strong> : trois 1.</li>
      <li><strong>666, 555, 444, 333, 222</strong> : trois dés identiques (brelan).</li>
      <li><strong>621</strong> : main spéciale.</li>
      <li><strong>654, 543, 432, 321</strong> : suites.</li>
      <li>Toute autre combinaison triée décroissante.</li>
    </ol>
    <h3>Pénalités</h3>
    <ul>
      <li>Le perdant du tour verse <strong>1 jeton au pot</strong>.</li>
      <li>Avec un <strong>4-2-1</strong>, le perdant verse <strong>3 jetons</strong>.</li>
      <li>Quand le pot atteint 5 jetons, il est remis au perdant du tour suivant.</li>
    </ul>
  `,
  scoreConfig: null, // score géré par jetons, pas par grille

  state: null,

  init(joueurs) {
    this.state = {
      joueurs: joueurs.map(j => ({ ...j, jetons: 6 })),
      joueurActuel: 0,
      des: [1,1,1],
      desGardes: [false,false,false],
      lancesRestants: 3,
      phase: 'lancer',
      pot: 0,
      tourScores: [], // score de chaque joueur pour le tour en cours
      tourJoueur: 0,  // combien ont joué ce tour
      meilleureMain: null,
    };
    return this.state;
  },

  lancerDes(state) {
    if (state.lancesRestants <= 0) return state;
    state.des = state.des.map((d, i) => state.desGardes[i] ? d : Math.ceil(Math.random() * 6));
    state.lancesRestants--;
    state.phase = 'scorer';
    return { ...state };
  },

  toggleGarde(state, idx) {
    if (state.lancesRestants === 3) return state;
    state.desGardes[idx] = !state.desGardes[idx];
    return { ...state };
  },

  valeurMain(des) {
    const s = [...des].sort((a,b)=>b-a);
    const str = s.join('');
    const MAINS = {
      '421': 1000, '111': 900,
      '666': 800, '555': 700, '444': 600, '333': 500, '222': 400,
      '621': 300,
      '654': 200, '543': 190, '432': 180, '321': 170,
    };
    if (MAINS[str] !== undefined) return MAINS[str];
    return parseInt(str);
  },

  valeurLabel(des) {
    const s = [...des].sort((a,b)=>b-a).join('');
    const LABELS = {
      '421':'4-2-1 !!!','111':'Brelan d\'As','666':'Brelan 6','555':'Brelan 5',
      '444':'Brelan 4','333':'Brelan 3','222':'Brelan 2','621':'6-2-1',
      '654':'Suite 6','543':'Suite 5','432':'Suite 4','321':'Suite 3',
    };
    return LABELS[s] || s;
  },

  validerTour(state) {
    const score = this.valeurMain(state.des);
    const label = this.valeurLabel(state.des);
    state.tourScores.push({ joueurIdx: state.joueurActuel, score, label, des: [...state.des] });
    // Tour suivant
    state.joueurActuel = (state.joueurActuel + 1) % state.joueurs.length;
    state.des = [1,1,1];
    state.desGardes = [false,false,false];
    state.lancesRestants = 3;
    state.phase = 'lancer';
    // Fin de tour quand tous ont joué
    if (state.tourScores.length === state.joueurs.length) {
      state.phase = 'resultat_tour';
    }
    return { ...state };
  },

  appliquerResultatTour(state) {
    const perdant = state.tourScores.reduce((min, s) => s.score < min.score ? s : min, state.tourScores[0]);
    const is421 = perdant.score === 1000;
    const penalite = is421 ? 3 : 1;
    state.joueurs[perdant.joueurIdx].jetons -= penalite;
    if (state.joueurs[perdant.joueurIdx].jetons < 0) state.joueurs[perdant.joueurIdx].jetons = 0;
    state.pot += penalite;
    if (state.pot >= 5) {
      state.joueurs[perdant.joueurIdx].jetons += state.pot;
      state.pot = 0;
    }
    state.tourScores = [];
    state.phase = 'lancer';
    // Vérifier fin
    const actifsRestants = state.joueurs.filter(j => j.jetons > 0).length;
    if (actifsRestants <= 1) state.phase = 'fin';
    return { ...state };
  },
};
