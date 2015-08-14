"use strict"

/**
 * Copyright (c) Clinton Freeman 2015
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// TODO: Render random correction tape behind some sections of the text.
// TODO: Margins are not being copied correctly in firefox developer edition. 

var smudge = ["q", "r", "o", "p", "a", "d", "b", "4", "6", "8", "9", "0", "@", "%", "&"];

function rand(iStart, iEnd) {
  return Math.floor((Math.random() * iEnd) + iStart) | 0;
}

function randF(fStart, fEnd) {
  return (Math.random() * fEnd) + fStart;
}

function parseColor(sColor) {
  if (sColor == null || sColor.indexOf('rgb') == -1) {
    return [0, 0, 0, 0];
  }

  var result = sColor.match(/\d+/g).map(function(sValue) {
    return parseInt(sValue);
  });

  // Make sure the color is rgba.
  if (result.length < 4) {
    var iSize = 4 - result.length;
    while(iSize--) {result.push(1)}
  }

  return result;
}

function randAlphaC(cColor, fStart, fEnd) {
  var result = cColor.slice();
  result[3] = randF(fStart, fEnd);

  return result;
}

function colorToS(cColor) {
  return "rgba("+cColor[0]+","+cColor[1]+","+cColor[2]+","+cColor[3]+")";
}

function chance(iProbability) {
  if (rand(0, 100) >= (100 - iProbability)) {
    return true;
  }

  return false;
}

function generateInkStrike(ctx, iHOffset, iWidth,
                           iHeight, cForeground, cBackground) {
  var hLower = (iHeight * 0.7) | 0;
  var hUpper = iHeight;

  var wLower = iHOffset;
  var wUpper = iWidth;

  var hGradient = rand(hLower, hUpper);
  var wGradient = rand(wLower, wUpper);

  var res = ctx.createLinearGradient(iHOffset, 0, wGradient, hGradient);
  res.addColorStop(0,colorToS(cForeground));

  var cFade = randAlphaC(cForeground, 0.35, 0.6);
  res.addColorStop(1,colorToS(cFade));
  return res;
}

function typeCharacter(ctx, sChar, sNextChar, iHOffset,
                       iVOffset, iHeight, iLineHeight, iElementWidth,
                       cForeground, cBackground) {
  var iWidth = ctx.measureText(sChar).width | 0;
  var iHalfHeight = (iLineHeight / 2) | 0;
  var iQuarHeight = (iHalfHeight / 2);

  // render transposition typographical errors.
  if (sChar != " " && sNextChar && chance(2)) {
    var cTypo = randAlphaC(cForeground, 0.1, 0.35);
    ctx.fillStyle = generateInkStrike(ctx, iHOffset, iWidth,
                      iHeight, cTypo, cBackground);                       // approximate type bar strike.
    ctx.fillText(sNextChar, iHOffset, iWidth+iVOffset+rand(0,2));
  }

  // render smudges / deepened bleed for characters with enclosing strokes.
  if (smudge.indexOf(sChar.toLowerCase()) != -1 && chance(10)) {
    var grd = ctx.createRadialGradient(iHOffset+rand(iWidth/3, iWidth/2), iVOffset+iQuarHeight, 1,
                                       iHOffset+rand(iWidth/3, iWidth/2), iVOffset+iQuarHeight, iWidth/2+1);

    grd.addColorStop(0, colorToS(randAlphaC(cForeground, 0.1, 0.2)));
    grd.addColorStop(1, colorToS(cBackground));
    ctx.fillStyle = grd;
    ctx.fillRect(iHOffset, iVOffset, iWidth, iHeight);

    //ctx.fillStyle = "rgb(255,0,0)";
    //ctx.arc(iHOffset + (iWidth / 2), iVOffset + (iQuarHeight / 2), 2.0, 0, 2*Math.PI);
    //ctx.fill();
  }

  // render the character tho the canvas.
  ctx.fillStyle = generateInkStrike(ctx, iHOffset, iWidth,
                                    iHeight, cForeground, cBackground);   // approximate type bar strike.
  ctx.fillText(sChar, iHOffset, iWidth+iVOffset+rand(0,2));               // render foundation character.
  ctx.fillText(sChar, iHOffset+rand(0, 1), iWidth+iVOffset+rand(0,2));    // bleed character onto the page.

  return iHOffset + iWidth;
}

function typeLine(ctx, sLine, iVOffset, iSize, iLineHeight, iElementWidth, cForeground, cBackground) {
  var iHOffset = 0;

  // render some correction tape.
  // if (chance(100)) {
  //   var oldFill = ctx.fillStyle;
    
  //   var iOffset = rand(0, sLine.length - 1);
  //   var iWidth = Math.min((sLine.length - iOffset),rand(1, 10));

  //   console.log(iOffset + "," + iWidth + "," + sLine.length);

  //   var iCharWidth = Math.ceil(ctx.measureText(sLine[0]).width) | 0;
  //   var iX1 = (iOffset * iCharWidth);// + rand(0, iCharWidth);
  //   var iX2 = iX1 + (iWidth * iCharWidth);// + rand(0, iCharWidth);
  //   var iY1 = iVOffset - (iLineHeight / 3);
  //   var iY2 = iVOffset + iLineHeight;

  //   console.log("["+iX1+","+iY1+"] ["+iX2+","+iY2+"]");

  //   ctx.fillStyle="rgb(255, 255, 255)"
  //   ctx.beginPath();
  //   ctx.moveTo(iX1, iY1);
  //   ctx.lineTo(iX1, iY2);
  //   ctx.lineTo(iX2, iY2);
  //   ctx.lineTo(iX2, iY1);
  //   ctx.closePath();
  //   ctx.fill();

  //   ctx.fillStyle = oldFill;
  // }

  for(var i = 0, len = sLine.length; i < len; i++) {
    iHOffset = typeCharacter(ctx, sLine[i], sLine[i+1], iHOffset, iVOffset,
                             iSize, iLineHeight, iElementWidth, cForeground,
                             cBackground);
  }

  return (iVOffset + iLineHeight);
}

function buildLines(ctx, sContent, iMaxWidth) {
  var aLines = new Array();

  // Estimte number of characters that can fit on a line.
  var iCharWidth = Math.ceil(ctx.measureText(sContent[0]).width) | 0;
  var iMaxLineLength = Math.floor(iMaxWidth / iCharWidth) | 0;

  var iLineEnd = sContent.length;
  var sRemainingContent = sContent;

  // Break the content into lines, making sure we don't split words.
  while (sRemainingContent.length > iMaxLineLength) {
    var iCurrentLineLength = Math.min(sRemainingContent.length, iMaxLineLength);
    iLineEnd = sRemainingContent.substring(0, iCurrentLineLength).lastIndexOf(" ");
    aLines.push(sRemainingContent.substring(0, iLineEnd));    
    sRemainingContent = sRemainingContent.substring(iLineEnd).trim();
  }

  aLines.push(sRemainingContent.substring(0, iLineEnd));

  return aLines;
}

function typeParagraph(eExisting) {
  // Create canvas element that we will use to re-render the content off the existing element.
  var eTmpCanvas = document.createElement("canvas");
  var existingStyle = eExisting.currentStyle || window.getComputedStyle(eExisting);

  // Model the size of the type off the existing element.
  var iSize = parseInt(existingStyle.getPropertyValue('font-size'));

  // Figure out height of canvas:
  eTmpCanvas.setAttribute("width", eExisting.offsetWidth);
  eTmpCanvas.setAttribute("height", eExisting.offsetHeight);
  var ctx = eTmpCanvas.getContext("2d");
  ctx.font = iSize + "px \"Courier New\",monospace";

  var aLines = buildLines(ctx, eExisting.innerHTML, eExisting.offsetWidth);
  var iLineHeight = iSize + (iSize * 0.4) | 0;

  // Create canvas for typewritter content.
  var eCanvas = document.createElement("canvas");
  eCanvas.setAttribute("width", eExisting.offsetWidth);
  eCanvas.setAttribute("height", aLines.length * iLineHeight);

  // Model the width and the height of the canvas off the existing element.
  var iElementWidth = eExisting.offsetWidth;

  // Copy the basic display settings across.
  eCanvas.style.border = existingStyle.border;
  eCanvas.style.display = existingStyle.display;
  eCanvas.style.margin = existingStyle.margin;
  eCanvas.style.padding = existingStyle.padding;
  //eCanvas.innerHTML = 'Your browser does not support the HTML5 canvas tag.';

  // Configure our canvas rendering context.
  var ctx = eCanvas.getContext("2d");
  ctx.font = iSize + "px \"Courier New\",monospace";
 
  var cForeground = parseColor(existingStyle.color);
  var cBackground = parseColor(existingStyle.backgroundColor);

  // Start pecking away at our virtual typewritter.
  var iVOffset = iLineHeight - iSize;
  var iHOffset = 0

  for (var i = 0, len = aLines.length; i < len; i++) {
    iVOffset = typeLine(ctx, aLines[i], iVOffset, iSize,
                        iLineHeight, iElementWidth, cForeground, cBackground);
  }

  // Replace the original content with our typewritten content.
  eExisting.parentNode.insertBefore(eCanvas, eExisting);
  eExisting.style.display = 'none';
}

// For each tag marked with the analogue class -- replace the content with a canvas typeset with analogue.
var aTypingList = document.querySelectorAll(".analogue");
for (var i = 0, len = aTypingList.length; i < len; i++) {
  typeParagraph(aTypingList[i])
}