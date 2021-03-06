﻿var longDateFormat = 'MM/dd/yyyy hh:mm:ss a';
var updating = false;
$(document)
    .ready(function() {
               
        var dataTable = $("#jobRequestsTable").DataTable({
            "order": [0, "desc"],
            "ajax": {
                "url": "/data/JobRequests",
                "dataSrc": function(json) {
                    for (var i = 0, ien = json.length; i < ien; i++) {
                        var column = 0;
                        var jobRequest = json[i];
                        json[i][column++] = "<a href=" +
                            jobRequest.url +
                            " target='_blank'>" +
                            jobRequest.requestId +
                            "</a>";

                        if (jobRequest.name === "Claimant Management Service")
                            console.log(jobRequest);

                        if (jobRequest.jobType === 'release')
                            json[i][column++] = '<span class="glyphicon glyphicon-plane" style="color:blue"></span>' +
                                jobRequest.jobType;
                        else if (jobRequest.jobType === 'build')
                            json[i][column++] = '<span class="glyphicon glyphicon-gift" style="color:green"></span>' +
                                jobRequest.jobType;

                        if (jobRequest.project != null)
                            json[i][column++] = "<span class='project'>" + jobRequest.project.name + "</span>";
                        else
                            json[i][column++] = "<span class='project'></span>";

                        if (jobRequest.jobType === 'build') {
                            // The path will always at least be "\" so the length needs to be more than one
                            if (jobRequest.buildFolder)
                                json[i][column++] = "<span class='path' style='color:blue'>[" +
                                    jobRequest.buildFolder.substring(1) +
                                    "]</span> " +
                                    jobRequest.name;
                            else
                                json[i][column++] = jobRequest.name;
                        } else
                            json[i][column++] = jobRequest.name;

                        if (jobRequest.launchedBy)
                            json[i][column++] = "<img src='" +
                                jobRequest.launchedBy.iconUrl +
                                "' style='width:15px;height:15px' /> " +
                                jobRequest.launchedBy.name;
                        else
                            json[i][column++] = "---";

                        switch (jobRequest.queueJobStatus) {
                        case "queued":
                            if (jobRequest.jobType === 'release')
                                json[i][column++] = '<span style="color:blue">Releasing</span>';
                            else
                                json[i][column++] = '<span style="color:blue">Queued</span>';
                            break;
                        case "assigned":
                            json[i][column++] = '<span style="color:blue">Assigned</span>';
                            break;
                        case "building":
                            json[i][column++] = '<span style="color:blue">Building</span>';
                            break;
                        case "deploying":
                            json[i][column++] = '<span style="color:blue">Releasing</span>';
                            break;
                        case "succeeded":
                            json[i][column++] = '<span style="color:green">Succeeded</span>';
                            break;
                        case "failed":
                            json[i][column++] = '<span style="color:red">Failed</span>';
                            break;
                        case "abandonded":
                            json[i][column++] = '<span style="color:gray">Abandoned</span>';
                            break;
                        case "cancelled":
                            json[i][column++] = '<span style="color:orange">Cancelled</span>';
                            break;
                        default:
                            json[i][column++] = '<span style="color:pink">' + jobRequest.queueJobStatus + '</span>';
                            break;
                        }


                        if (jobRequest.finishTime)
                            json[i][column++] = "<span class='datetime'>" +
                                $.format.date(jobRequest.finishedTime, longDateFormat) +
                                "</span>";
                        else if (jobRequest.startedTime)
                            json[i][column++] = "<span class='datetime'>" +
                                $.format.date(jobRequest.startedTime, longDateFormat) +
                                "</span>";
                        else if (jobRequest.queuedTime)
                            json[i][column++] = "<span class='datetime'>" +
                                $.format.date(jobRequest.queuedTime, longDateFormat) +
                                "</span>";
                        else if (jobRequest.assignedTime)
                            json[i][column++] = "<span class='datetime'>" +
                                $.format.date(jobRequest.assignedTime, longDateFormat) +
                                "</span>";
                        else
                            json[i][column++] = "---";

                    }
                    updating = false;
	            setTimeout(function() {
	                dataTable.ajax.reload(null, false);
        	    }, 2000);
                    return json;
                }
            }

        });

      

    });