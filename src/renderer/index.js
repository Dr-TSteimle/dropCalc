'use strict';

// jetpack
import jetpack from "fs-jetpack";
var excel = require('node-excel-export');
// ipcRenderer
const { ipcRenderer } = require('electron')
window.ipcRenderer = ipcRenderer

import { remote } from "electron";
const app = remote.app;
var appDir = window.appDir = jetpack.cwd(app.getAppPath());


// JQuery
var $ = window.$ = window.jQuery = require('jquery');
// Templating par pug
const pug = require('pug')

import "./style.css";
import "./icons.css";
const styles = document.createElement('style');

styles.innerText = `.empty{display:flex;flex-direction:column;justify-content:center;height:100vh;position:relative}.footer{bottom:0;font-size:13px;left:50%;opacity:.9;position:absolute;transform:translateX(-50%);width:100%}`;


document.head.appendChild(styles);


// JQuery
var $ = window.$ = window.jQuery = require('jquery');
const file = 'settings.json';


ipcRenderer.send("get-settings")


// conf

// helpers
function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function getValues(data,key) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    res.push(data[i][key])
  }
  return res;
}

function findValues(data,key,val) {
  var values = getValues(data,key);

  var res = [];
  for (var i = 0; i < values.length; i++) {
    if(typeof values[i] != "undefined") {
      if(window.settings.caseSens) {
        if(values[i] == val) {
          res.push(i);
        }
      } else {
        if(values[i].toLowerCase() == val.toLowerCase ()) {
          res.push(i);
        }
      }
    }
  }
  return res;
}

function getADN(str) {
  str = str.replace(/ /g,"")
  var posN = str.length-2
  // Vérifie si bien à la fin sinon retourne la val par defaut
  if(str.indexOf(window.settings.ngName) !== posN) {
    return parseInt(window.settings.ngDefault);
  } else {
    // Récupere les 3 caractères devant le ngName
    var nano = str.substr(str.length-(window.settings.ngName.length+3),3);
    // Si c'est par un chiffre rendre la val par défaut sinon le rendre
    if(isNaN(+nano)) {
      return parseInt(window.settings.ngDefault);
    } else {
      return parseInt(nano);
    }
  }
}

function erreur(str) {
  var modal = `
  <div class="modal active" id="modal-erreur">
    <a href="#close" id="fond" class="modal-overlay" aria-label="Close"></a>
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title h5">Erreur !</div>
      </div>
      <div class="modal-body">
        <div class="content">
          ${str}
        </div>
      </div>
      <div class="modal-footer">
        ...
      </div>
    </div>
  </div>`;

  $("#app").html(modal)
  $("body").on("click", function(e) {
    if (e.target.id == "fond") {
      window.data = 0;
      window.res = 0;
      $("#app").html(landing);
    }
  });
}


function pref() {
  var aMod = (window.settings.acceptModif) ? "checked=''" : "";
  var aCas = (window.settings.caseSens) ? "checked=''" : "";
  var modal = `
  <div class="modal active" id="modal-erreur">
    <a href="#close" id="fond" class="modal-overlay" aria-label="Close"></a>
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title h5">Préférences</div>
      </div>
      <div class="modal-body">
        <div class="content" style="text-align:left" id="form-pref">
          <div class="form-group">
            <label class="form-label" for="input-example-1">Nom de l'albumine</label>
            <input class="form-input" type="text" id="albuTargetName" value="${window.settings.albuTargetName}">
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-1">Nom du NTC</label>
            <input class="form-input" type="text" id="ntcTargetName" value="${window.settings.ntcTargetName}">
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-1">Nom du PBL</label>
            <input class="form-input" type="text" id="pblName" value="${window.settings.pblName}">
          </div>
          <div class="form-group">
            <label class="form-switch">
              <input id="caseSens" type="checkbox" ${aCas}>
              <i class="form-icon"></i> La détection des noms doit être sensible aux majuscules.
            </label>
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-1">Nombre minimum de gouttelettes acceptées par puit</label>
            <input class="form-input" type="text" id="minAccPuit" value="${window.settings.minAccPuit}">
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-1">Nombre minimum de gouttelettes positives au delà duquel le puit est positif</label>
            <input class="form-input" type="text" id="minPosPuit" value="${window.settings.minPosPuit}">
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-1">Nombre de cellules équivalent 1ng d'ADN</label>
            <input class="form-input" type="text" id="cellDNA" value="${window.settings.cellDNA}">
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-1">Quantité d'ADN par puit par defaut (ng)</label>
            <input class="form-input" type="text" id="ngDefault" value="${window.settings.ngDefault}">
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-1">Abrévation de nanograme</label>
            <input class="form-input" type="text" id="ngName" value="${window.settings.ngName}">
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-1">Volume par puit en µL</label>
            <input class="form-input" type="text" id="volPuit" value="${window.settings.volPuit}">
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-3">Colonnes nécessaires à l'analyses</label>
            <textarea class="form-input" id="minHeaders" placeholder="Textarea" rows="3">${window.settings.minHeaders}</textarea>
          </div>
          <div class="form-group">
            <label class="form-switch">
              <input id="acceptModif" type="checkbox" ${aMod}>
              <i class="form-icon"></i> Les fichiers csv peuvent avoir été modifiés.
            </label>
          </div>
          <div class="form-group">
            <label class="form-label" for="input-example-3">Colonnes présentes dans les csv non modifiés</label>
            <textarea class="form-input" id="headers" placeholder="Textarea" rows="3">${window.settings.headers}</textarea>
          </div>
          <button class="btn" onclick="$('#app').html(landing)">Retour</button>
          <button class="btn btn-primary" onclick="savePref(this)">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>`;

  $("#app").html(modal)
  $("body").on("click", function(e) {
    if (e.target.id == "fond") {
      $("#app").html(landing);
    }
  });
}
window.pref = pref;

function savePref() {
  var inputs = $('#form-pref input');
  for (var i = 0; i < inputs.length; i++) {
    if( $(inputs[i]).attr("type") == "checkbox" ) {
      window.settings[$(inputs[i]).attr("id")] = $(inputs[i]).is(":checked");
    } else {
      window.settings[$(inputs[i]).attr("id")] = $(inputs[i]).val();
    }
  }

  window.settings['minHeaders'] = ($("#minHeaders").val()).split(",");
  window.settings['headers'] = ($("#headers").val()).split(",");
  ipcRenderer.send("set-settings",window.settings)
  $('#app').html(landing);
}
window.savePref = savePref;

function getValFromInd(data,ind) {
  var res = []
  for (var i = 0; i < ind.length; i++) {
    res.push(data[ind[i]]);
  }
  return res;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function resPuit(data) {
  var acc= false
  var res = false
  var err = ""
  if (parseInt(data.AcceptedDroplets) >=  window.settings.minAccPuit) {
    var acc = true;
    if(parseInt(data.Positives) >= window.settings.minPosPuit) {
      var res = "pos"
    } else {
      var res = "neg"
    }
  } else {
    var err = "Nombre de goutelettes insuffisant.";
  }
  return {
    accepeted: acc,
    result: res,
    erreur: err,
    nAccepted: parseInt(data.AcceptedDroplets),
    nPos: parseInt(data.Positives),
    cible: data.Target,
    puit: data.Well,
    Concentration: data.Concentration,
    Seuil: data.Threshold
  }
}

// fun
function getResPuitSampleTarget(all,sample,target) {
  var pos = findValues(all,"Sample",sample)
  var rest2Sample = getValFromInd(all,pos)

  var pos = findValues(rest2Sample,"Target",target)
  var rest2SampleTarget = getValFromInd(rest2Sample,pos)

  var res = []
  for (var i = 0; i < rest2SampleTarget.length; i++) {
    res.push(resPuit(rest2SampleTarget[i]))
  }
  return res
}

function checkCsvValidity() {
  for (var i = 0; i < window.data.files.length; i++) { //chaque fichier

    // efface les doublons en supprimant les derniers
    var wells = [];
    var ncsv = []
    for (var j = 0; j < window.data.files[i].csv.length; j++) {
      var jscv = window.data.files[i].csv[j];
      if (wells.toString().indexOf(jscv.Well) == -1) {
        wells.push(jscv.Well);
        ncsv.push(jscv);
      }
    }
    window.data.files[i].csv = ncsv;

    var test = true
    var modif = false;
    var err = "";

    var set = window.settings;

    var setH = set.headers;
    var headersManq = [];
    for (var j = 0; j < setH.length; j++) {
      var fHeadersStr = Object.keys(window.data.files[i].csv[0]).toString();
      if ( fHeadersStr.indexOf(setH[j]) == -1 ) {
        headersManq.push(setH[j]);
        modif = true;
      }
    }
    var setHM = set.minHeaders;
    var minHeadersManq = [];
    for (var j = 0; j < setHM.length; j++) {
      var fHeadersStr = Object.keys(window.data.files[i].csv[0]).toString();
      if ( fHeadersStr.indexOf(setHM[j]) == -1 ) {
        minHeadersManq.push(setHM[j]);
        test = false;
      }
    }

    if (!set.acceptModif && modif) {
      err  = "Fichier CSV incompatible colonne \""+ headersManq +"\" absente.";
      test = false
    } else {
      if(!test) {
        err = "Fichier CSV incompatible colonne \""+ minHeadersManq +"\" absente.";
      }
    }



    if(test) {
      $("tbody tr").eq(i).children("td").eq(2).html("OK")
      window.data.files[i].validity = true;
      var testEAU = true

      // détection des CTRL et vérrif pour chaque fichier/run
      var csvi = window.data.files[i].csv;
      var iEau = findValues(csvi,"Sample",window.settings.ntcTargetName)

      if(iEau.length == 0) {
        testEAU = false;
        var errEau = "Le puit \""+window.settings.ntcTargetName+"\" est absent du fichier."; // mdlkjfkdjf
      } else {
        var resEau = []
        var csvEau =  getValFromInd(csvi,iEau);
        for (var j = 0; j < csvEau.length; j++) {
          resEau.push(resPuit(csvEau[j]))
        }
        var nPuitsPos = 0;
        var errEau = "";
        for (var j = 0; j < resEau.length; j++) {
          if(resEau[j].erreur != "") {
            testEAU = false
            errEau = resEau[j].erreur
          } else {
            if(resEau[j].result == "pos") {
              nPuitsPos++;
              testEAU = false;
              errEau = nPuitsPos+" / " + resEau.length
            }
          }
        }
      }
      if(testEAU) {
        $("tbody tr").eq(i).children("td").eq(3).html(nPuitsPos+" / " + resEau.length)

        // Targets
        var cibles = getValues(csvi,"Target")
        var ciblesUniques = cibles.filter( onlyUnique )
        $("tbody tr").eq(i).children("td").eq(4).html(ciblesUniques)
        //PBL
        var res = []
        for (var j = 0; j < ciblesUniques.length; j++) {
          res.push(...getResPuitSampleTarget(csvi,"PBL",ciblesUniques[j]))
        }

        var nPos = 0;
        var nNeg = 0;
        for (var j = 0; j < res.length; j++) {
          if(res[j].result == "pos") {
            nPos++
          }
          if(res[j].result == "neg") {
            nNeg++
          }
        }
        $("tbody tr").eq(i).children("td").eq(5).html(nPos+" / "+(nNeg+nPos))
      } else {
        $("tbody tr").eq(i).children("td").eq(3).html(errEau)
        $("tbody tr").eq(i).children("td").eq(4).html("---")
        $("tbody tr").eq(i).children("td").eq(5).html("---")
        window.data.files[i].validity = false;
      }
    } else {
      $("tbody tr").eq(i).children("td").eq(2).html(err)
      $("tbody tr").eq(i).children("td").eq(3).html("Annulé")
      $("tbody tr").eq(i).children("td").eq(4).html("---")
      $("tbody tr").eq(i).children("td").eq(5).html("---")
      window.data.files[i].validity = false;
    }
  }
}

function findSamples() {
  window.res = {}
  window.res.samples = []
  var files = window.data.files
  var all = [];

  for (var i = 0; i < files.length; i++) {
    if (files[i].validity) {
      for (var j = 0; j < files[i].csv.length; j++) {
        files[i].csv[j].nFile = i
      }
      all = files[i].csv.concat(all);
    }
  }
  window.all = all

  // chercher les albu
  var albu = findValues(all,"Target",window.settings.albuTargetName)

  if(albu.length == 0) {
    var err = `
    <p>La cible \"${window.settings.albuTargetName}\" est absente des fichiers</p>
    <p>impossible de continuer !</p>
    <p>Merci de ré-enregistrer le CSV contenant les cibles \"${window.settings.albuTargetName}\"</p>
    `
    erreur(err)
  } else {
    samplesNames = []
    for (var i = 0; i < albu.length; i++) {
      samplesNames.push(all[albu[i]].Sample)
    }
    var samplesNames = samplesNames.filter( onlyUnique )

    for (var i = 0; i < samplesNames.length; i++) { // chaque cible albu
      var sa = samplesNames[i]
      // recupere le nom sample
      if(sa != window.settings.ntcTargetName && sa!= window.settings.pblName) {
        var pos = findValues(all,"Sample",sa) // trouve dans tous les puits ayant le meme nom que celui de l'albu
        var restSample = getValFromInd(all,pos)

        var cib = getValues(restSample,"Target")
        var ciblesUniques = cib.filter( onlyUnique )

        //trouve e fichier dans lequel la cible autre que ALBUa été mesure
        var fich = getValues(restSample,"nFile")
        var fichUniques = fich.filter( onlyUnique )

        window.res.samples.push({
          sample: sa,
          cible: ciblesUniques,
          fichier: fichUniques,
          val: restSample
        })
      }
    }

    if(window.res.samples.length == 0 ) {
      var err = `
      <p>La cible \"${window.settings.albuTargetName}\" n'a pas été mesurée sur les échantillons ou n'est pas/mal renseignée.</p>
      <p>impossible de continuer !</p>
      <p>Merci de ré-enregistrer le CSV contenant les cibles \"${window.settings.albuTargetName}\"</p>
      `
      erreur(err)
    } else {
      var table_html = pug.render(samplesPug, { data: window.res.samples });
      $("#app").html(table_html);

      for (var i = 0; i < window.res.samples.length; i++) {
        var p = window.res.samples[i]
        $("tbody tr").eq(i).on( "click",p,function (event) { printRes(event.data);  })
      }
    }
  }
}
window.findSamples = findSamples;

function printRes(data) {
  const heading = [[
    'date manip',
    'eCRF',
    'patient',
    'GLIMS',
    'pathology',
    'Sample/date',
    'Target',
    'TIME POINT',
    'ng of gDNA/well',
    'ALBU Concentration',
    'ALBU DROPLETS total accepted',
    'L',
    'M',
    'nb dropplet pos dans les 6 puits du PBL (target)',
    'Threshold',
    'copies/µl',
    'copies/µl',
    'copies/µl',
    'events',
    'events',
    'events',
    'droplets',
    'droplets',
    'droplets',
    'Moyenne des concentrations des puits ',
    'Nombre de puits acceptés',
    'GLIMS = interTumo Cells ddPCR interpretation',
    'RATIO without ALBU',
    'RATIO with ALBU',
    'RATIO with ALBU A',
    'RATIO with ALBU B',
    'RATIO with ALBU C',
  ]];
  const styles = {
    headerBlank: { fill: { patternType: "none" } },
    cellYellow: {
      fill: {
        fgColor: {
          rgb: 'FFFF00'
        }
      }
    } };

  const specification = {
  date_manip: {
      width: '10'
    },
    eCRF: {
      width: '10'
    },
    patient: {
      width: '30'
    },
    GLIMS: {
      width: '10'
    },
    pathology: {
      width: '10'
    },
    Sample_date: {
      width: '10'
    },
    Target: {
      width: '10'
    },
    TIME_POINT: {
      width: '10'
    },
    ng_of_gDNA_well: {
      width: '10'
    },
    Albu_conc: {
      width: '10'
    },
    Albu_acc: {
      width: '10'
    },
    vide: {
      width: '0'
    },
    videe: {
      width: '0'
    },
    PBL_gt_pos: {
      width: '10'
    },
    Albu_seuil: {
      width: '10'
    },
    conc_1: {
      width: '10'
    },
    conc_2: {
      width: '10'
    },
    conc_3: {
      width: '10'
    },
    pos_1: {
      width: '10'
    },
    pos_2: {
      width: '10'
    },
    pos_3: {
      width: '10'
    },
    acc_1: {
      width: '10',
      cellStyle: function(value, row) {
        return (value < 9000) ? styles.cellYellow : {};
      },
    },
    acc_2: {
      width: '10',
      cellStyle: function(value, row) {
        return (value < 9000) ? styles.cellYellow : {};
      },
    },
    acc_3: {
      width: '10',
      cellStyle: function(value, row) {
        return (value < 9000) ? styles.cellYellow : {};
      },
    },
    moy_conc: {
      width: '10'
    },
    pt_acc: {
      width: '10'
    },
    interTum: {
      width: '10'
    },
    ratioWoAlb: {
      width: '10'
    },
    ratioAlb: {
      width: '10'
    },
    ratioAlb_A: {
      width: '10'
    },
    ratioAlb_B: {
      width: '10'
    },
    ratioAlb_C: {
      width: '10'
    },
  }

  // var styles = {  headerBlank: { fill: { patternType: "none" } }}
  for (var i = 0; i < Object.keys(specification).length; i++) {
    specification[Object.keys(specification)[i]]["headerStyle"] = { fill: { patternType: "none"  }  }
    specification[Object.keys(specification)[i]]["displayName"] = " "
  }

  var fichUniques = data.fichier
  var sample = data.sample
  var cible = data.cible
  var table_html = "<h3>"+sample+"</h3>";

  for (var i = 0; i < fichUniques.length; i++) {
    var fileName = window.data.files[fichUniques[i]].name;
    var val = window.data.files[fichUniques[i]].csv;
    var result = [];
    var CR = {is: false, fileName: []};
    for (var j = 0; j < cible.length; j++) {
      var r = getResPuitSampleTarget(val,sample,cible[j])
      result.push(...r)

      if(cible[j] != "ALBU") {
        if(r.length !=0) {
          var DNA = getADN(sample)
          var albu = getResPuitSampleTarget(window.all,sample,"ALBU")[0]

          var albu_con = albu.Concentration
          var albu_acc = albu.nAccepted
          var albu_seuil = albu.Seuil
          var pbl = getResPuitSampleTarget(val,"PBL",cible[j])
          var pbl_gt_pos = 0;
          if(pbl.length>0) {
            for (var k = 0; k < pbl.length; k++) {
              pbl_gt_pos = pbl_gt_pos + pbl[k].nPos
            }
          }
          var conc = []
          var nPos = []
          var nAcc = []
          nAcc[0] = conc[0] = nPos[0] = ""
          nAcc[1] = conc[1] = nPos[1] = ""
          nAcc[2] = conc[2] = nPos[2] = ""
          var mConc = 0
          var mConcAcc = 0
          var pAcc = 0

          for (var k = 0; k < r.length; k++) {
            conc[k] = parseFloat(r[k].Concentration)
            mConc = mConc + parseFloat(r[k].Concentration)
            nPos[k] = r[k].nPos
            nAcc[k] = r[k].nAccepted
            if(r[k].accepeted) { 
              pAcc++ 
              mConcAcc = mConcAcc + parseFloat(r[k].Concentration)
            }
          }
          mConc = mConc / (r.length)
          mConcAcc = mConcAcc / pAcc

          /*var interTum = (mConc * parseInt(window.settings.volPuit))
          var ratioWoAlb = round((mConc * parseInt(window.settings.volPuit)) / (DNA * parseInt(window.settings.cellDNA) ),7)
          var ratioAlb = round(mConc / parseInt(albu_con),7)*/
          var interTum = (mConcAcc * parseInt(window.settings.volPuit))
          var ratioWoAlb = round((mConcAcc * parseInt(window.settings.volPuit)) / (DNA * parseInt(window.settings.cellDNA) ),7)
          var ratioAlb = round(mConcAcc / parseInt(albu_con),7)

          interTum = (interTum == 0 ) ? "< 10^-8" : interTum;
          ratioWoAlb = (ratioWoAlb == 0 ) ? "< 10^-8" : ratioWoAlb;
          ratioAlb = (ratioAlb == 0 ) ? "< 10^-8" : ratioAlb;

          var ratioAlb_A = round(parseFloat(r[0].Concentration) / parseInt(albu_con), 7)
          var ratioAlb_B = round(parseFloat(r[1].Concentration) / parseInt(albu_con), 7)
          var ratioAlb_C = round(parseFloat(r[2].Concentration) / parseInt(albu_con), 7)

          const dataset = [
            {
              date_manip: 'NA',
              eCRF: 'NA',
              patient : sample,
              GLIMS: 'NA',
              pathology: 'NA',
              Sample_date: 'NA',
              Target: cible[j],
              TIME_POINT: 'NA',
              ng_of_gDNA_well: DNA,
              Albu_conc: parseInt(albu_con),
              Albu_acc: parseInt(albu_acc),
              PBL_gt_pos: parseInt(pbl_gt_pos),
              Albu_seuil: parseInt(albu_seuil),
              conc_1: parseFloat(conc[0]),
              conc_2: parseFloat(conc[1]),
              conc_3: parseFloat(conc[2]),
              pos_1: parseInt(nPos[0]),
              pos_2: parseInt(nPos[1]),
              pos_3: parseInt(nPos[2]),
              acc_1: parseInt(nAcc[0]),
              acc_2: parseInt(nAcc[1]),
              acc_3: parseInt(nAcc[2]),
              moy_conc: mConc,
              pt_acc: pAcc,
              interTum: interTum,
              ratioWoAlb: ratioWoAlb,
              ratioAlb: ratioAlb,
              ratioAlb_A: ratioAlb_A,
              ratioAlb_B: ratioAlb_B,
              ratioAlb_C: ratioAlb_C,
            }
          ]

          const report = excel.buildExport([{
                name: 'Résultats',
                heading: heading,
                specification: specification,
                data: dataset
              }])

          var reportName = + new Date()+".xlsx"
          jetpack.write(reportName  ,report);
          CR.is = true;
          CR.fileName.push({name: reportName, cible: cible[j], data: dataset[0]});
        }
      }
    }

    table_html += pug.render(resultats, { data: {
      fileName: fileName,
      sample: sample,
      results: result,
      CR: CR
    }});

  }
  $("#app").html("<div class='card' style='max-height:87vh; overflow:auto; padding-bottom:7px'>"+table_html+"</div>"); //
}

function dl(fileName) {
  ipcRenderer.send('save-cr',fileName);
}
window.dl = dl;

// templates
var landing =`
  <div>
    <div>
      <p class="empty-title h5">Bienvenue sur dropCalc !
      <p class=empty-subtitle>Merci de choisir le dossier correspondant à la manip' à analyser.
      <div class=empty-action>
        <p><button class="btn btn-primary" onclick="ipcRenderer.send('chose-dir')"><i class="icon icon-upload"></i> Ouvrir le dossier</button></p>
        <p><button class="btn" onclick="pref()"><i class="icon icon-edit"></i> Préférences</button></p>
      </div>
    </div>
  </div>`
window.landing = landing;

var fichiersPug = `
.container
  .card(style="max-height: 87vh; overflow:auto;")
    h5.card-header
      Fichiers CSV présents dans le dossier :
    .card-body
        table.table
          thead
            tr
              th Fichiers
              th Date
              th Validité
              th NTC positifs
              th Cibles
              th PBL positifs
          tbody
            each file in files
              tr
                td= file.name
                td= file.date
                td
                  .loading
                td
                  .loading
                td
                  .loading
                td
                  .loading
    .card-footer
      button(id="retour" class="btn" onclick="$('#app').html(window.landing)") Annuler
      button(id="analyse" class="btn btn-primary" onclick="window.findSamples()" style="margin-left:13px") Continuer
`

var samplesPug = `
.container
  .card(style="max-height: 87vh; overflow:auto;")
    .card-header
      h5.card-title Échantillons présents dans les CSV :
      .card-subtitle.text-gray Cliquez sur l'échantillon à analyser
    .card-body
      table.table.table-hover
        thead
          tr
            th Échantillons
            th Cibles

        tbody
          each ech in data
            - var cible = ech.cible.toString()

            tr
              td= ech.sample
              td= cible

    .card-footer
      button.btn(onclick="$('#app').html(window.landing)") Annuler
`

var resultats =  `
.container
  .card(style="margin-bottom:5px")
    .card-header(style="text-align:left")
      - var str = "CSV : "+data.fileName
      h5.card-title= str
    .card-body
      table.table
        thead
          tr
            th Puit
            th Cible
            th Gouttelettes Acceptées
            th Gouttelettes Positives
            th Concentration
            th Seuil
        tbody
          each res in data.results
            tr
              td= res.puit
              td= res.cible
              td= res.nAccepted
              td= res.nPos
              td= res.Concentration
              td= res.Seuil
    .card-footer
      button(id="analyse" class="btn" onclick="window.findSamples()") Retour
      if data.CR.is
        .container(style="text-align:left;margin-top:13px")
          .columns
          each fn in data.CR.fileName
            - var txt = "Enregistrer "+fn.cible
            .column.col-4
              .card
                .card-header
                  h5.card-title= fn.cible
                .card-body
                  p Ratio ADN (#{fn.data.ng_of_gDNA_well} ng) #{fn.data.ratioWoAlb}
                  p Ratio Albu #{fn.data.ratioAlb}
                .card-footer
                  button.btn.btn-primary(onclick="dl('"+fn.name+"')" style="margin-left:13px") Enregistrer
`

ipcRenderer.on('dir', (event, arg) => {
  window.data = arg;
  var table_html = pug.render(fichiersPug, { files: arg.files });
  $("#app").html(table_html);
  for (var i = 0; i < arg.files.length; i++) {
    arg.files[i];
    ipcRenderer.send('get-CSV',{dir:arg.dir,file:arg.files[i].name});
  }
});

ipcRenderer.on('set-settings', (event, arg) => {
  window.settings = arg;
});

ipcRenderer.on('csv', (event, arg) => {
  for (var i = 0; i < window.data.files.length; i++) {
    if(window.data.files[i].name == arg.file) {
      window.data.files[i].csv = arg.csv;
    }
  }
  var test = true;
  for (var i = 0; i < window.data.files.length; i++) { //chaque fichier
    if(typeof window.data.files[i].csv == "undefined") { test = false }
  }
  if(test) {
    checkCsvValidity()
  }
});

// init
$("body").addClass("empty")
$("#app").html(landing).css("z-index",50)
$("<p class=footer style='z-index: 5'>dropCalc v0.9 - Thomas Steimlé Mai 2019</p>").appendTo("body")
