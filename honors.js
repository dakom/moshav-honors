var HONORS = (function() {
    var people, honors, honorIndexLookup, invalidHonorComboMasks, assignmentLog, FULL_MASK;


    function updateAssignments() {
        assignmentLog = [];

        for (var i = 0; i < honorIndexLookup.length; i++) {
            var honor = honorIndexLookup[i];

            //get potential people for this honor, i.e. names which have this honor in their potentialHonorMask
            var potentialPeople = (function() {


                var ret = [];
                for (var pi = 0; pi < people.length; pi++) {
                    var person = people[pi];
                    if (person.potentialHonorMask & honor.bit) {
                        ret.push(person);
                    }
                }

                return ret;

            })();

            //if nobody is available for this honor, then everybody is available for this honor
            if (potentialPeople.length == 0) {
                potentialPeople = people;
            }

            //for each honor, assign it to a random person on the list - and cull the list as needed against their potential honors
            (function assignHonor(targetList) {
                var pi = Math.floor(Math.random() * targetList.length);
                var person = targetList[pi];
                var culledList;

                //Check for invalid combos...
                //if the list is reduced to just one person (i.e. everyone else was invalidated too), then they are it
                if (targetList.length > 1) {
                    for (var c = 0; c < invalidHonorComboMasks.length; c++) {
                        var combo = invalidHonorComboMasks[c];

                        //if the target honor falls in one of the invalid combos...
                        //and the person has one of those combos assigned...
                        if (((honor.bit & combo) != 0) && ((person.honorMask & combo) != 0)) {
                            assignmentLog.push("Not assigning [" + honor.id + "] to [" + person.name + "], combo of: [" + honorMaskToList(combo) + "] is invalid and they have: [" + honorMaskToList(person.honorMask) + "] which yields exclusion on [" + honorMaskToList(person.honorMask & combo) + "]");

                            //take this person out of the running for this honor on the next try
                            //but do it via a copy so that the next honor uses the full list
                            culledList = targetList.concat();
                            culledList.splice(pi, 1);
                            break;
                        }
                    }
                }

                if (culledList === undefined) {
                    person.honorMask |= honor.bit;
                    if (person.history === undefined) {
                        person.history = {};
                    }

                    if (person.history[honor.id] === undefined) {
                        person.history[honor.id] = {
                            count: 0
                        };
                    }
                    person.history[honor.id].count++;

                } else {
                    assignHonor(culledList);
                }


            })(potentialPeople);

        }
    }



    function exportConfig() {
        //strip the unnecessary data from what we've got and provide in proper config format

        var peopleConfig = [];
        for (var i = 0; i < people.length; i++) {
            var person = people[i];
            var personConfig = {
                name: person.name
            }

            if (person.acceptHonorMask != 0) {
                personConfig.acceptHonors = honorMaskToList(person.acceptHonorMask);
            }

            if (person.rejectHonorMask != 0) {
                personConfig.rejectHonors = honorMaskToList(person.rejectHonorMask);
            }

            if (person.history !== undefined) {
                personConfig.history = person.history;
            }

            peopleConfig.push(personConfig);
        }


        return {
            people: peopleConfig,
        }
    }

    function exportSettings() {
        //strip the unnecessary data from what we've got and provide in proper config format

        var honorsConfig = [];
        for (var i = 0; i < honorIndexLookup.length; i++) {
            var honor = honorIndexLookup[i];
            honorsConfig.push({
                id: honor.id,
                name: honor.name,
            });
        }

        var invalidCombosConfig = [];
        for (var i = 0; i < invalidHonorComboMasks.length; i++) {
            invalidCombosConfig.push(honorMaskToList(invalidHonorComboMasks[i]));
        }

        return {
            honors: honorsConfig,
            invalidCombos: invalidCombosConfig
        }
    }

    //utilities
    function honorListToMask(hList) {
        var hMask = 0;

        if (hList !== undefined) {
            for (var i = 0; i < hList.length; i++) {
                var honor = honors[hList[i]];
                hMask |= honor.bit;
            }
        }

        return hMask;
    }

    function honorMaskToList(honorMask) {
        var ret = [];

        //shift each bit off the end until there's nothing left, and track the shift count in case there's a match
        for (var i = 0; honorMask > 0; honorMask >>= 1, i++) {
            var honorBit = honorMask & 1;
            if (honorMask & honorBit) {
                ret.push(honorIndexLookup[i].id);
            }
        }

        return ret;
    }

    function honorMaskToHtmlList(honorMask, addHighlight) {

        var str = "";
        var hList = honorMaskToList(honorMask);

        for (var i = 0; i < hList.length; i++) {
            str += "<li>";
            if (addHighlight) {
                str += "<span class='highlight'>";
            }
            str += honors[hList[i]].name;
            if (addHighlight) {
                str += "</span>";
            }
            str += "</li>";

        }
        if (str !== "") {
            str = "<ul>" + str + "</ul>";
        } else {
            str = "<ul>[NONE]</ul>";
        }

        return str;
    }

    function historyToHtmlList(history) {

        var str = "";
        for (var honorName in history) {
            str += "<li>" + honorName + ": " + history[honorName].count + "</li>";
        }

        if (str !== "") {
            str = "<ul>" + str + "</ul>";
        } else {
            str = "<ul>[NONE]</ul>";
        }

        return str;
    }

    return {
        LoadSettings: function(settings) {
            honors = {};
            honorIndexLookup = [];
            invalidHonorComboMasks = [];

            FULL_MASK = 0;

            for (var i = 0; i < settings.honors.length; i++) {
                var honor = settings.honors[i];
                honor.bit = 1 << i;
                honor.idx = i;
                honors[honor.id] = honor;
                honorIndexLookup.push(honor);

                FULL_MASK |= honor.bit;
            }

            for (var i = 0; i < settings.invalidCombos.length; i++) {
                var comboMask = honorListToMask(settings.invalidCombos[i]);
                invalidHonorComboMasks.push(comboMask);
            }
        },

        LoadConfig: function(config) {
            people = [];

            for (var i = 0; i < config.people.length; i++) {
                var personConfig = config.people[i];

                var acceptHonorMask = honorListToMask(personConfig.acceptHonors);
                var rejectHonorMask = honorListToMask(personConfig.rejectHonors);

                //start by assuming user can have any honor
                var potentialHonorMask = FULL_MASK;

                //if they are only accepting certain ones, that's our actual starting point
                if (acceptHonorMask != 0) {
                    potentialHonorMask = acceptHonorMask;
                }

                //from what's remaining, reject the specific ones they want rejected if any are set
                if (rejectHonorMask != 0) {
                    potentialHonorMask &= ~rejectHonorMask;
                }

                var person = {
                    index: i,
                    acceptHonorMask: acceptHonorMask,
                    rejectHonorMask: rejectHonorMask,
                    name: personConfig.name,
                    potentialHonorMask: potentialHonorMask,
                    honorMask: 0
                }

                if (personConfig.history !== undefined) {
                    person.history = personConfig.history;
                }

                people.push(person);
            }
        },

        Generate: function() {

            updateAssignments();
            return exportConfig();
        },

        PrintConfig: function(label) {
          label = (label === undefined) ? "" : " FOR " + label;

          document.write("<h3>----CONFIG" + label + "----</h3>");
          document.write("<b>Config:</b> " + JSON.stringify(exportConfig()));
        },

        PrintSettings: function(label) {
          label = (label === undefined) ? "" : " FOR " + label;

          document.write("<h3>----SETTINGS" + label + "----</h3>");
          document.write("<b>Settings:</b> " + JSON.stringify(exportSettings()));
        },

        PrintReport: function(label) {
            label = (label === undefined) ? "" : " FOR " + label;

            document.write("<h3>----REPORT" + label + "----</h3>");

            for (var i = 0; i < people.length; i++) {
                var person = people[i];
                var html = "";
                html += "<ul>";
                html += "<li><h3>" + person.name + "</h3></li>";
                html += "<ul><li>Assigned: " + honorMaskToHtmlList(person.honorMask, true) + "</li></ul>";
                html += "<ul><li>Potential Options: " + honorMaskToHtmlList(person.potentialHonorMask) + "</li></ul>";
                html += "<ul><li>Updated History: " + historyToHtmlList(person.history) + "</li></ul>";
                html += "<ul><li>Configured Accepting: " + honorMaskToHtmlList(person.acceptHonorMask) + "</li></ul>";
                html += "<ul><li>Configured Rejecting: " + honorMaskToHtmlList(person.rejectHonorMask) + "</li></ul>";
                html += "</ul>";

                document.write(html);
            }

            for (var i = 0; i < assignmentLog.length; i++) {
                document.write("<p><b>" + assignmentLog[i] + "</b></p>");
            }

        },

        PrintAssignments: function(label) {
            var html = "";
            label = (label === undefined) ? "" : " FOR " + label;
            document.write("<h3>----ASSIGNMENTS" + label + "----</h3>");
            html += "<ul>";
            for (var i = 0; i < honorIndexLookup.length; i++) {
                var honor = honorIndexLookup[i];
                for (pi = 0; pi < people.length; pi++) {
                    var person = people[pi];
                    if (person.honorMask & honor.bit) {
                        html += "<li>" + honor.name + ": " + person.name + "</li>";
                        break;
                    }
                }
            }

            html += "</ul>";
            document.write(html);
        }
    }

}());
