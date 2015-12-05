export default {
  "error" : {
    "intro" : "Oops!"
  },
  "action" : {
    "add" : "Add",
    "addItem" : "Add {{item}}",
    "cancel" : "Cancel",
    "choose" : "Choose",
    "done" : "Done",
    "hide" : "Hide",
    "login" : "Login",
    "logout" : "Logout",
    "manageDataProperties" : "Manage data sources",
    "remove" : "Remove",
    "removeItem" : "Remove {{item}}",
    "save" : "Save",
    "show" : "Show",
  },
  "login" : {
    "title" : "Welcome to SolarNetwork!",
    "intro" : "Please log in to view your SolarNode dashboard.",
    "nodeId" : {
      "label" : "Node ID",
      "placeholder" : "Enter your SolarNode unique ID.",
      "required" : "A node ID is required."
    },
    "authToken" : {
      "label" : "Auth token",
      "placeholder" : "Enter a SolarNetwork auth token."
    },
    "authSecret" : {
      "label" : "Secret",
      "placeholder" : "Enter the auth token secret.",
    },
    "submit" : "Go",
    "showToken" : "Use security token",
    "needToken" : "A security token is required to access this node.",
    "forbidden" : "The credentials you provided are not valid."
  },
  "nav" : {
    "title" : "{{nodeId}} Console",
    "home" : "Home"
  },
  "getStarted" : {
    "title" : "Let’s get started",
    "intro" : "Here’s a list of chart suggestions based on the data posted by your node recently. Pick the ones you’d like to start with. Don’t fret if the chart name looks funny—you’ll be able to change the chart settings later on.",
    "advanced" : "Advanced Setup"
  },
  "chartSuggestion" : {
    "group" : {
      "consumption" : "Consumption",
      "generation" : "Generation"
    },
    "consumption" : {
      "title" : "Consumption — {{source}}"
    },
    "energy-io" : {
      "title" : "Energy I/O"
    },
    "energy-io-pie" : {
      "title" : "Energy I/O percent"
    },
    "energy-io-overlap" : {
      "title" : "Energy I/O overlap"
    },
    "generation" : {
      "title" : "{{subtype}} Generation — {{source}}"
    },
    "general" : {
      "title" : "General — {{source}}"
    }
  },
  "pickSources" : {
    "title" : "Choose data sources",
    "intro" : "Here’s a list of available data sources posted by your node recently. Pick the ones you’d like to view."
  },
  "home" : {
    "title" : "Overview"
  },
  "chart" : {
    "period" : {
      "hour" : {"one": "hour", "other": "hours"},
      "day" : {"one": "day", "other": "days"},
      "month" : {"one": "month", "other": "months"},
      "year" : {"one": "year", "other": "years"}
    },
    "aggregate" : {
      "FiveMinute" : "five minute",
      "Hour" : "hour",
      "Day" : "day",
      "Month" : "month",
      "Year" : "year",
    },
    "edit" : {
      "title" : "Settings",
      "toggleSettingsVisibility" : "Toggle Settings",
      "chartTitle" : "Name",
      "dateRange" : "Date range",
      "timePeriod" : "Period",
      "timeDuration" : "Duration",
      "startDate" : "Start date",
      "endDate" : "End date",
      "aggregate" : "Detail level",
      "sources" : "Sources",
      "source" : {
        "title" : "Name",
        "source" : "Source ID",
        "prop" : "Property",
        "unit" : "Unit",
        "unitWithDefault" : "Unit ({{default}})"
      },
      "sourceGroup" : {
        "title" : "Group"
      },
      "prop" : {
        "title" : "Name",
        "prop" : "Property",
      }
    },
    "export" : "Export"
  },
  "data-props" : {
    "title" : "Manage data sources",
    "intro" : "Here are all the available data sources posted by your SolarNode. Each data source can have any number of properties associated with it. Use this page to assign friendly names, colors, and other information to any of these properties.",
    "edit" : {
      "noSourceSelected" : "Select a data source.",
      "source" : {
        "title" : "Source name",
      }
    }
  }
};
