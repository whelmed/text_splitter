// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipc = require('electron').ipcRenderer;
var fs = require('fs');
const splitResults = document.getElementById("results");

function getFileContents(file) {
    return fs.readFileSync(file.path).toString();
}

function formatText(text, splitSize) {
    text = text.replace(/(\r\n|\n|\r)/gm,"");

    var addLines = text.replace(/([\.\!\?] *)/ig, function(m) {
        // Trim any additional spaces
        m = m.trimRight();
        return `${m}\n`;
    });

    var textArray = addLines.split('\n'),
        rollingLength = 0,
        output = '';
    
    for (let sentence of textArray) {
        var currentSenteceLength = sentence.length,
            rollingLength = rollingLength + currentSenteceLength;

        if (rollingLength >= (splitSize || 300)) {
            output = `${output} ${sentence}\n\n`;
            rollingLength = 0
        }
        else {
            output = `${output}${sentence} `;
        }

    }
    return output; 
}
function formatFileText(file, splitSize) {
    return formatText(getFileContents(file), splitSize);
    
}

const holder    = document.getElementById('holder');
const paraSize  = document.getElementById('para-size');


paraSize.onchange = (e) => {
    e.preventDefault();
    if (splitResults.value) {
        splitResults.value = formatText(splitResults.value, parseInt(paraSize.value, 10));
    }
}

holder.ondragover = () => {
    return false;
}

holder.ondragleave = holder.ondragend = () => {
    return false;
}

holder.ondrop = (e) => {
    e.preventDefault();

    for (let f of e.dataTransfer.files) {
        // Read file into memory as UTF-16
        splitResults.value = formatFileText(f, parseInt(paraSize.value, 10));
    }
    return false;
}

ipc.on('saved-file', function (event, path) {
  if (path) {
    fs.writeFile(path, splitResults.value, function(err) {
        
    }); 
  }
  
});