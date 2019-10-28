/*
MuddyMap.js
Copyright 2016 Lawrence Weru (LDubya)
*/

function isInt(n) {
	return n % 1 === 0;
}

function getcountyData(adata) { // returns an array where each key represents a county, and the entries are the category totals
	var tempcountyData = [];
	for (i = 1; i < adata.length; i++) {

		var int_fips = +adata[i][mapSettings.fipsColumn - 1]; // FIPS as int (no leading zeroes)
		// console.log("int_fips:");
		// console.log(int_fips);

		mapSettings.categories.map(function (category, k) { // using map so it stays sync, but return null.
			// store county data in cache in case of county w/ multiple rows

			var voteCount = +adata[i][category.column - 1];

			if (!tempcountyData[int_fips]) { // construct the array entry representing this county if it doesn't exist
				tempcountyData[int_fips] = [];
			}

			if (!tempcountyData[int_fips][k]) { // if this category's total hasn't been entered yet, enter it
				tempcountyData[int_fips][k] = voteCount;
			} else { // if this category's total has already been entered, add to it
				tempcountyData[int_fips][k] += voteCount;
			}
		})
	}
	return tempcountyData;
}

function getcountyTotals(countyData) { // get a list of just the totals from each county. No need to maintain keys as FIPS
	var countyTotals = countyData.filter(function (v, k) {
		if (!v) { // exclude null entries
			return false;
		}
		return true;
	}).map(function (v, k) {
		return v.reduce((a, b) => a + b, 0); // sum
	});
	return countyTotals
}

function getPopulationStats(totals) { // adopted from https://stackoverflow.com/a/45804710/1937233

	var stats = {
		count: totals.length,
		lowerFence: 0,
		q1: 0,
		q3: 0,
		upperFence: 0,
		min: Math.min.apply(null, totals),
		max: Math.max.apply(null, totals),
	}

	var values = totals.slice().sort((a, b) => a - b); //copy array fast and sort

	if ((values.length / 4) % 1 === 0) { //find quartiles
		stats.q1 = 1 / 2 * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
		stats.q3 = 1 / 2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
	} else {
		stats.q1 = values[Math.floor(values.length / 4 + 1)];
		stats.q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
	}

	iqr = stats.q3 - stats.q1;
	stats.upperFence = stats.q3 + iqr * 1.5;
	stats.lowerFence = stats.q1 - iqr * 1.5;

	return stats;

}

function setAllCountiesAsBlack() {
	// /*
	$('path').each(function () {
		$self = $(this);
		id = $self.attr("id");
		$self.css("stroke", "none");

		switch (id) {
			// case "State_Lines":
			case "separator":
				$self.css("stroke", "rgb(230,230,230)");
		}
		if (isInt(id)) {
			$self.css("fill", "black");
		}
	});
	// */
}

function getHueFromCategories(key, categories) {
	return categories[key].hue;
}

function getRunnerUp(arr){ 
	// will return the runner up total. 
	// if it's a tie, the runner up's total is same as winner's total.
	biggest = -Infinity,
	next_biggest = -Infinity;

	for (var i = 0, n = arr.length; i < n; ++i) {
		var thisNum = +arr[i]; // convert to number first

		if (thisNum > biggest) {
			next_biggest = biggest; // save previous biggest value
			biggest = thisNum;
		} else if (thisNum > next_biggest) {
			next_biggest = thisNum; // new second biggest value
		}
	}

	return next_biggest;
}

function processData(data) {
	// Change colors of counties if we have data, skip the header row

	adata = $.csv.toArrays(data);
	svg = $("#map").children()[0];

	if (adata.length < 4) {
		console.log("not enough data for statistical analysis.");
		return false;
	}

	// Start all counties as black
	setAllCountiesAsBlack();

	// cache
	var countyData = getcountyData(adata); // id : [d,g,t]// id is the FIPS int
	var countyTotals = getcountyTotals(countyData);

	// population statistics
	var stats = getPopulationStats(countyTotals);
	var maxPopulation = stats.upperFence; // the max population for the lightness scale
	console.log(stats);

	// colors
	for (i = 1; i < adata.length; i++) {
		var proper_fips = adata[i][mapSettings.fipsColumn - 1].padStart(5, '0'); // county FIPS
		var int_fips = +proper_fips; // FIPS as int (no leading zeroes)
		var $element = $("#" + proper_fips);

		// load data from cache
		var thisCountyTotals = countyData[int_fips]; // an array of totals. ex [1000,1000,2000]. The keys should match mapSettings.categories array keys
		var winningTotal = Math.max.apply(null, thisCountyTotals);
		var runnerUpTotal = getRunnerUp(thisCountyTotals);
		var thisCountyTotal = thisCountyTotals.reduce((a, b) => a + b, 0);

		// hsl
		var hue;
		var saturation;
		var lightness;

		// figure out hue
		hue = getHueFromCategories(thisCountyTotals.indexOf(winningTotal), mapSettings.categories);

		// figure out saturation
		saturation = Math.round(
			Math.abs(winningTotal - (runnerUpTotal)) / thisCountyTotal * 100 // new way, allowing for >2 categories
		);

		// figure out lightness
		var relativeVotePopulation = (Math.min(thisCountyTotal, maxPopulation)) / maxPopulation;
		lightness = 1 - (relativeVotePopulation);
		lightness = (lightness * 50) + 50; // (Math.round(lightness*100) / 2) + 50;

		// generate color
		var solid_color = "hsl(" + hue + ",100%" + ",50%" + ")"; // varying saturation
		var saturated_color = "hsl(" + hue + "," + saturation + "%" + ",50%" + ")"; // varying saturation
		var light_color = "hsl(" + hue + "," + saturation + "%" + "," + lightness + "%" + ")"; // varying saturation and lightness

		var strokeColor = saturated_color;
		var strokeWidth = .1;

		// distinguish the counties that are above the upper fence?
		// /*
		if (mapSettings.distinguishUpper) {
			if (thisCountyTotal > maxPopulation) {
				strokeColor = "hsl(" + (mapSettings.upperHue || 60) + "," + "100%" + ",50%" + ")"; // 
				strokeWidth = 1;
			}
		}
		// */

		switch(mapSettings.type){
			case "winnerTakesAll":
				$element.css("fill", solid_color).css("stroke", strokeColor).css("stroke-width", strokeWidth); // for color-bordered counties
				break;

			case "neutralizing":
				$element.css("fill", saturated_color).css("stroke", strokeColor).css("stroke-width", strokeWidth); // for color-bordered counties
				break;
			
			case "muddy":
			default:
				$element.css("fill", light_color).css("stroke", strokeColor).css("stroke-width", strokeWidth); // for color-bordered counties
		}

		

	}
}