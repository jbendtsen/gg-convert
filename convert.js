"use strict";

function getProperty(id, prop) {
	return window.getComputedStyle(document.getElementById(id)).getPropertyValue(prop);
}

function setProperty(id, prop, value) {
	document.getElementById(id).style.setProperty(prop, value);
}

function resetCodeWnd() {
	var info_fs_h = getProperty("info_fs", "height");
	setProperty("code_fs", "height", info_fs_h);
}

function setCodeType(radio) {
	var type = radio.value;
	if (type === "6d") {
		setProperty("cmp_row", "visibility", "collapse");
	}
	else if (type == "8d") {
		setProperty("cmp_row", "visibility", "visible");
	}
	else
		return;

	radio.checked = "checked";
	resetCodeWnd();
}

function readHexNumber(str, max, name) {
	var n = parseInt(str, 16);
	if (isNaN(n)) {
		alert("The " + name + " is not a valid hex number");
		return;
	}
	if (n < 0 || n > max) {
		alert("The " + name + " is out of range (must be within [0-" + max + "])");
		return;
	}

	return n;
}

var gg_set = "APZLGITYEOXUKSVN".split("");

function encode6(addr, value) {
	var set = [];
	set.length = 6;

	set[0] = ((value >> 4) & 8) | (value & 7);
	set[1] = ((addr >> 4) & 8) | ((value >> 4) & 7);
	set[2] = 8 | ((addr >> 4) & 7);
	set[3] = (addr & 8) | ((addr >> 12) & 7);
	set[4] = ((addr >> 8) & 8) | (addr & 7);
	set[5] = (value & 8) | ((addr >> 8) & 7);

	var i;
	for (i = 0; i < set.length; i++)
		set[i] = gg_set[set[i]];

	return set.join("");
}

function encode8(addr, value, compare) {
	var set = [];
	set.length = 8;

	set[0] = ((value >> 4) & 8) | (value & 7);
	set[1] = ((addr >> 4) & 8) | ((value >> 4) & 7);
	set[2] = 8 | ((addr >> 4) & 7);
	set[3] = (addr & 8) | ((addr >> 12) & 7);
	set[4] = ((addr >> 8) & 8) | (addr & 7);
	set[5] = (compare & 8) | ((addr >> 8) & 7);
	set[6] = ((compare >> 4) & 8) | (compare & 7);
	set[7] = (value & 8) | ((compare >> 4) & 7);

	var i;
	for (i = 0; i < set.length; i++)
		set[i] = gg_set[set[i]];

	return set.join("");
}

function decode(code) {
	if (code.length != 6 && code.length != 8) {
		alert("Invalid code length (must be either 6 or 8 characters long)");
		return;
	}

	var set = code.toUpperCase().split("");
	var i;
	for (i = 0; i < code.length; i++) {
		var c = gg_set.indexOf(set[i]);
		if (c < 0) {
			alert("Invalid character '" + set[i] + "' found in Game Genie code");
			return;
		}

		set[i] = c;
	}

	var result = ["", "", ""];

	var addr = (8 | (set[3] & 7)) << 12;
	addr |= ((set[4] & 8) | (set[5] & 7)) << 8;
	addr |= ((set[1] & 8) | (set[2] & 7)) << 4;
	addr |= (set[3] & 8) | (set[4] & 7);

	if (set.length == 6) {
		var value = ((set[0] & 8) | (set[1] & 7)) << 4;
		value |= (set[5] & 8) | (set[0] & 7);

		result[0] = addr;
		result[1] = value;
	}
	else {
		var value = ((set[0] & 8) | (set[1] & 7)) << 4;
		value |= (set[7] & 8) | (set[0] & 7);

		var compare = ((set[6] & 8) | (set[7] & 7)) << 4;
		compare |= (set[5] & 8) | (set[6] & 7);

		result[0] = addr;
		result[1] = value;
		result[2] = compare;
	}

	return result;
}

function setCode(str) {
	document.getElementById("code").value = str;
}

function setInfo(numList) {
	document.getElementById("address").value = numList[0].toString(16);
	document.getElementById("value").value = numList[1].toString(16);
	document.getElementById("compare").value = numList[2].toString(16);
}

function clickEncode() {
	var longcode;
	if (document.getElementById("ct_6").checked)
		longcode = false;
	else if (document.getElementById("ct_8").checked)
		longcode = true;
	else
	{
		alert("Invalid button state");
		return;
	}

	var addressStr = document.getElementById("address").value;
	var valueStr = document.getElementById("value").value;
	var compareStr = document.getElementById("compare").value;

	var addr = readHexNumber(addressStr, 65535, "code address");
	if (addr == null) {
		setCode("");
		return;
	}

	var value = readHexNumber(valueStr, 255, "code value");
	if (value == null) {
		setCode("");
		return;
	}

	var output;
	if (longcode) {
		var compare = readHexNumber(compareStr, 255, "code compare");
		if (compare == null) {
			setCode("");
			return;
		}

		output = encode8(addr, value, compare);
	}
	else {
		output = encode6(addr, value);
	}

	setCode(output);
	setInfo(decode(output));
}

function clickDecode() {
	var code = document.getElementById("code").value;
	if (code.length != 6 && code.length != 8) {
		return;
	}

	var info = decode(code);
	setInfo(info);

	if (info[2].toString(16).length > 0) {
		setCodeType(document.getElementById("ct_8"));
		setCode(encode8(info[0], info[1], info[2]));
	}
	else {
		setCodeType(document.getElementById("ct_6"));
		setCode(encode6(info[0], info[1]));
	}
}

function initPage() {
	setCodeType(document.getElementById("ct_6"));
	setInfo(["", "", ""]);
	setCode("");
}
