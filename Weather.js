$(document).ready(() => {

   const API = {
      KEY: "58aee28527bdf3c3ee2286a85c98202e",

      URL(city) {
         return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.KEY}`
      },

      LOCATION(lat, lon) {
         return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.KEY}`
      }
   }

   const DOC = {
      INPUT: {
         VALUE: $("#CityInput"),
         SUBMIT: $("#CityBtn"),
         LOCATION: $("#locationDot"),
         CLEAR: $("#ClearBtn")
      },

      DISPLAY: {
         MESSAGE: {
            WELCOME: $("#WelcomeMsg"),
            ERROR: $("#InvalidSearch"),
            INFO: $("#Error")
         },

         RECENT: {
            CONTAINER: $("#RecentSearches"),
            LIST: $("#SearchList")
         },

         WEATHER: {
            CONTAINER: $("#MainContainer"),
            CITY: $("#CityDisplay"),
            ICON: $("#IconDisplay"),
            SKY: $("#SkyDisplay"),
            TEMPERATURE: $("#TemperatureDisplay"),
            HUMIDITY: $("#HumidityDisplay"),
            WIND: $("#WindSpeedDisplay")
         }
      }
   };

   const Error = (info, style1, style2, alert) => {
      DOC.DISPLAY.MESSAGE.ERROR.css("display", style1);
      DOC.DISPLAY.WEATHER.CONTAINER.css("display", style2);
      DOC.DISPLAY.MESSAGE.WELCOME.css("display", "none");
      DOC.DISPLAY.MESSAGE.INFO.text(info);
      if (alert) setTimeout(() => window.alert(alert), 500);
   };

   const saveSearch = (city) => {
      let recentSearches = JSON.parse(localStorage.getItem("recentSearch")) || [];
      if (!recentSearches.includes(city)) recentSearches.unshift(city);
      if (recentSearches.length > 6) recentSearches.pop();
      localStorage.setItem("recentSearch", JSON.stringify(recentSearches));
   };

   const displayRecentSearch = () => {
      let recentSearches = JSON.parse(localStorage.getItem("recentSearch")) || [];
      DOC.DISPLAY.RECENT.LIST.empty();
      if (recentSearches.length === 0) DOC.DISPLAY.RECENT.CONTAINER.hide();
      else DOC.DISPLAY.RECENT.CONTAINER.show();
      recentSearches.forEach((city) => DOC.DISPLAY.RECENT.LIST.append(`<a>${city}</a>`));
   };

   const fetchWeatherData = async (url) => {
      try {
         const RESPONSE = await fetch(url);
         if (!RESPONSE.ok) Error("City not found", "block", "none");
         return RESPONSE.json();
      }
      catch (Errors) {
         console.error(Errors);
      }
   };

   const setWeatherIcon = (id) => {

      icon = (i) => DOC.DISPLAY.WEATHER.ICON.attr("src", `Images/${i}.png`)

      if (id >= 200 && id < 300) icon("lightning")
      if (id >= 300 && id < 400) icon("drizzle")
      if (id >= 500 && id < 600) icon("rain")
      if (id >= 600 && id < 700) icon("snow")
      if (id >= 700 && id < 800) icon("windy")
      if (id === 800) icon("clear")
      if (id > 800) icon("cloudy")
   };

   const displayWeatherInfo = (data) => {

      const {
         name, main: { temp, humidity },
         weather: [{ description, id }],
         wind: { speed }
      } = data;

      setWeatherIcon(id);

      DOC.DISPLAY.WEATHER.CONTAINER.hide();
      DOC.DISPLAY.WEATHER.CONTAINER.fadeIn(500);
      DOC.DISPLAY.MESSAGE.WELCOME.css("display", "none");
      DOC.DISPLAY.WEATHER.SKY.text(description);
      DOC.DISPLAY.WEATHER.CITY.text(name);
      DOC.DISPLAY.WEATHER.HUMIDITY.text(`${humidity}%`);
      DOC.DISPLAY.WEATHER.WIND.text(`${Math.floor(speed * 3.6)} km/h`);
      DOC.DISPLAY.WEATHER.TEMPERATURE.text(
         `${Math.floor(((temp - 273.15) * 9 / 5) + 32)}°F -
          ${Math.floor(temp - 273.15)}°C`
      );
   };

   DOC.DISPLAY.RECENT.LIST.on("click", "a", function () {
      const city = $(this).text();
      fetchWeatherData(API.URL(city)).then(data => {
         displayWeatherInfo(data);
         Error("", "none", "block");
      });
   });

   DOC.INPUT.LOCATION.click(() => {

      getWeatherByLocation = async (lat, lon) => {
         return await fetchWeatherData(API.LOCATION(lat, lon));
      };

      successCallback = async (position) => {
         const { latitude, longitude } = position.coords;
         const DATA = await getWeatherByLocation(latitude, longitude);
         displayWeatherInfo(DATA);
         Error("", "none", "block");
      };

      errorCallback = () => {
         Error(
            "Location access denied", "block", "none",
            "Please press allow this site to use location")
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
   });

   DOC.INPUT.SUBMIT.click(submit = async () => {
      const CITY = DOC.INPUT.VALUE.val();
      if (CITY) {
         const DATA = await fetchWeatherData(API.URL(CITY));
         displayWeatherInfo(DATA);
         saveSearch(DATA.name);
         displayRecentSearch();
         Error("", "none", "block");
      } else {
         Error("Please enter a city", "block", "none");
      }
   });

   DOC.INPUT.VALUE.on("keypress", function (event) {
      if (event.key === "Enter") submit()
   });

   DOC.INPUT.CLEAR.click(() => {
      localStorage.clear(); displayRecentSearch()
   });

   displayRecentSearch();

});
