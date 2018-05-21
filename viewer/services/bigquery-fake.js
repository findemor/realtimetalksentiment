
module.exports = {
  queryHistory: function({ since = null, limit = 100, callback }) {

    const data = [];
    const whenInit = since || 1526732400;
    const whenIncrement = 10;
    const maxFaces = 20;
    
    let faces = 0;
    let joyPct, angerPct, sorrowPct, surprisePct;

    for(let i = 1; i <= limit; i++) {

      faces = Math.floor((Math.random() * maxFaces));

      joyPct = Math.floor((Math.random() * faces));
      angerPct = Math.floor((Math.random() * (faces - joyPct)));
      sorrowPct = Math.floor((Math.random() * (faces - joyPct - angerPct)));
      surprisePct = Math.floor((Math.random() * (faces - joyPct - angerPct - sorrowPct)));

      data.push({ 
        when: whenInit + whenIncrement * i,
        file: (whenInit + whenIncrement * i) + "",
        topic: "",
        faces: faces,
        joy: joyPct,
        anger: angerPct,
        sorrow: sorrowPct,
        surprise: surprisePct
      });
    }

    callback(null,data);
  }
};