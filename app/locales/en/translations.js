export default {
  "error" : {
    "intro" : "Oops!"
  },
  "action" : {
    "done" : "Done",
    "login" : "Login",
    "logout" : "Logout",
    "save" : "Save"
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
    "consumption" : {
      "title" : "Consumption — {{source}}"
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
    "edit" : {
      "title" : "Settings",
      "chartTitle" : "Name",
      "dateRange" : "Date range",
      "timePeriod" : "Period",
      "timeDuration" : "Duration",
      "startDate" : "Start date",
      "endDate" : "End date"
    },
    "export" : "Export"
  }
};
