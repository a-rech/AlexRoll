export default {
  id: 'yams',
  nom: 'Yams',
  emoji: '🎲',
  type: 'dés',
  joueursMin: 2,
  joueursMax: 6,
  description: 'Lancez 5 dés jusqu\'à 3 fois pour réaliser les meilleures combinaisons.',
  regles: `
    <h3>But du jeu</h3>
    <p>Chaque joueur remplit sa grille de score en 13 manches. Le joueur avec le plus de points gagne.</p>
    <h3>Déroulement d'un tour</h3>
    <ol>
      <li>Lancez les 5 dés.</li>
      <li>Gardez ceux que vous voulez en cliquant dessus, relancez les autres (2 fois max).</li>
      <li>Inscrivez votre score dans une case libre de votre choix.</li>
    </ol>
    <h3>Combinaisons</h3>
    <ul>
      <li><strong>As à 6</strong> : somme des dés correspondants.</li>
      <li><strong>Brelan</strong> : 3 dés identiques → somme des 3.</li>
      <li><strong>Carré</strong> : 4 dés identiques → somme des 4.</li>
      <li><strong>Full</strong> : brelan + paire → 25 pts.</li>
      <li><strong>Petite suite</strong> : 4 dés consécutifs → 30 pts.</li>
      <li><strong>Grande suite</strong> : 5 dés consécutifs → 40 pts.</li>
      <li><strong>Yams</strong> : 5 dés identiques → 50 pts.</li>
      <li><strong>Chance</strong> : somme de tous les dés.</li>
    </ul>
    <p><em>Bonus : si la somme As→6 ≥ 63, +35 pts.</em></p>
  `,
  scoreConfig: {
    sections: [
      {
        titre: 'Combinaisons hautes',
        lignes: [
          { id: 'as',    label: 'As',    hint: 'somme des 1', calc: d => d.filter(x=>x===1).reduce((a,b)=>a+b,0) },
          { id: 'deux',  label: 'Deux',  hint: 'somme des 2', calc: d => d.filter(x=>x===2).reduce((a,b)=>a+b,0) },
          { id: 'trois', label: 'Trois', hint: 'somme des 3', calc: d => d.filter(x=>x===3).reduce((a,b)=>a+b,0) },
          { id: 'quatre',label: 'Quatre',hint: 'somme des 4', calc: d => d.filter(x=>x===4).reduce((a,b)=>a+b,0) },
          { id: 'cinq',  label: 'Cinq',  hint: 'somme des 5', calc: d => d.filter(x=>x===5).reduce((a,b)=>a+b,0) },
          { id: 'six',   label: 'Six',   hint: 'somme des 6', calc: d => d.filter(x=>x===6).reduce((a,b)=>a+b,0) },
        ]
      },
      {
        titre: 'Combinaisons basses',
        lignes: [
          { id: 'brelan',      label: 'Brelan',       hint: '3 identiques',       calc: d => { const c=count(d); return Object.values(c).some(v=>v>=3)?Object.keys(c).filter(k=>c[k]>=3).reduce((a,k)=>a+parseInt(k)*c[k],0):0; } },
          { id: 'carre',       label: 'Carré',        hint: '4 identiques',       calc: d => { const c=count(d); const k=Object.keys(c).find(k=>c[k]>=4); return k?parseInt(k)*4:0; } },
          { id: 'full',        label: 'Full',         hint: 'brelan + paire = 25',calc: d => { const c=count(d); const v=Object.values(c); return (v.includes(3)&&v.includes(2))||v.includes(5)?25:0; } },
          { id: 'petite_suite',label: 'Petite suite', hint: '4 consécutifs = 30', calc: d => { const u=[...new Set(d)].sort((a,b)=>a-b); return (hasSeq(u,4))?30:0; } },
          { id: 'grande_suite',label: 'Grande suite', hint: '5 consécutifs = 40', calc: d => { const u=[...new Set(d)].sort((a,b)=>a-b); return (hasSeq(u,5))?40:0; } },
          { id: 'yams',        label: 'Yams',         hint: '5 identiques = 50',  calc: d => { const c=count(d); return Object.values(c).some(v=>v>=5)?50:0; } },
          { id: 'chance',      label: 'Chance',       hint: 'somme totale',       calc: d => d.reduce((a,b)=>a+b,0) },
        ]
      }
    ]
  },

  // État du jeu
  state: null,

  init(joueurs) {
    this.state = {
      joueurs: joueurs.map(j => ({ ...j, scores: {}, total: 0, sousTotal: 0, bonus: 0 })),
      joueurActuel: 0,
      des: [1,1,1,1,1],
      desGardes: [false,false,false,false,false],
      lancesRestants: 3,
      phase: 'lancer', // 'lancer' | 'scorer' | 'fin'
      manche: 1,
      manchesTotal: 13,
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

  getScorePossible(state, ligneId) {
    const section = state.phase === 'scorer' ? this.scoreConfig.sections.flatMap(s=>s.lignes).find(l=>l.id===ligneId) : null;
    if (!section) return 0;
    return section.calc(state.des);
  },

  inscrireScore(state, ligneId) {
    const joueur = state.joueurs[state.joueurActuel];
    if (joueur.scores[ligneId] !== undefined) return state;
    const ligne = this.scoreConfig.sections.flatMap(s=>s.lignes).find(l=>l.id===ligneId);
    joueur.scores[ligneId] = ligne.calc(state.des);
    // Recalcul totaux
    const sousTotal = ['as','deux','trois','quatre','cinq','six'].reduce((a,id) => a + (joueur.scores[id]||0), 0);
    joueur.bonus = sousTotal >= 63 ? 35 : 0;
    joueur.sousTotal = sousTotal;
    joueur.total = Object.values(joueur.scores).reduce((a,b)=>a+b,0) + joueur.bonus;
    // Tour suivant
    state.joueurActuel = (state.joueurActuel + 1) % state.joueurs.length;
    if (state.joueurActuel === 0) state.manche++;
    state.des = [1,1,1,1,1];
    state.desGardes = [false,false,false,false,false];
    state.lancesRestants = 3;
    state.phase = 'lancer';
    const totalLignes = this.scoreConfig.sections.flatMap(s=>s.lignes).length;
    if (state.manche > state.manchesTotal) state.phase = 'fin';
    return { ...state };
  },
};

function count(des) {
  return des.reduce((a, d) => { a[d] = (a[d]||0)+1; return a; }, {});
}
function hasSeq(sorted, len) {
  let streak = 1;
  for (let i=1; i<sorted.length; i++) {
    streak = sorted[i] === sorted[i-1]+1 ? streak+1 : 1;
    if (streak >= len) return true;
  }
  return false;
}
