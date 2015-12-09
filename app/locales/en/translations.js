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
    "downloadData" : "Download Data",
    "getStarted" : "Chart Suggestions",
    "hide" : "Hide",
    "login" : "Login",
    "logout" : "Logout",
    "manageDataProperties" : "Manage Data Sources",
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
      "sourceGroups" : "Source Groups",
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
      },
      "props" : {
        "manageHint" : "Expecting to see more properties?",
        "manageHintAction" : "Manage your data properties.",
      },
      "sourceProps" : {
        "manageHint" : "Expecting to see more sources or properties?",
        "manageHintAction" : "Manage your data sources.",
      },
    },
    "export" : "Export"
  },
  "data-props" : {
    "title" : "Manage data sources",
    "intro" : "Here are all the available data sources posted by your SolarNode. Each data source can have any number of properties associated with it. Use this page to assign friendly names, colors, and other information to any of these properties.",
    "action" : {
      "addNode" : "Add Another Node",
    },
    "edit" : {
      "help" : "Choose a <b>source</b> from the list on the left to start. All the available <b>properties</b> for that source will then be shown to the right.",
      "noSourceSelected" : "Select a data source.",
      "sources" : {
        "title" : "Sources",
      },
      "source" : {
        "id" : "Source ID",
        "heading" : "{{name}} Source",
        "title" : "Name",
        "placeholder" : "Enter a friendly name",
        "caption" : "You can give this source a more friendly name here. This name will be used for display purposes only.",
      },
      "props" : {
        "title" : "{{source}} Properties",
      },
      "prop" : {
        "prop" : {
          "title" : "Property",
          "placeholder" : "Property name",
          "caption" : "This is the property name as it is posted by the SolarNode.",
        },
        "title" : {
          "title" : "Name",
          "placeholder" : "Friendly name",
          "caption" : "You can give this property a more friendly name, for display purposes only.",
        },
        "color" : {
          "title" : "Color",
        },
        "unit" : {
          "title" : "Unit",
          "placeholder" : "Unit of measurement",
          "placeholderWithDefault" : "Unit ({{default}})",
          "caption" : "Enter the unit of measurement used by this property."
        },
      },
    },
    "addNode" : {
      "title" : "Add Node",
      "intro" : "You can add more data sources from other SolarNodes by filling in the following form:",
      "submit" : "Add Node",
      "nodeIdPlaceholder" : "Enter a SolarNode ID.",
    },
  }
};
