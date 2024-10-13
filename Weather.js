$(document).ready(() => {

   const API_KEY = "58aee28527bdf3c3ee2286a85c98202e";

   const INPUT = {
      LOCATION_FIELD: $("#CityInput"),
      SUBMIT_BTN: $("#CityBtn"),
      LOCATION_BTN: $("#locationDot"),
      CLAER_BTN: $("#ClearBtn"),
   };

   const DISPLAY = {
      WELCOME_MESSAGE: $("#WelcomeMsg"),
      ERROR_MESSAGE: $("#InvalidSearch"),
      RECENT_SEARCH: $("#RecentSearches"),
      SEARCH_LIST: $("#SearchList"),
      WEATHER_CONTAINER: $("#MainContainer"),
      CITY_NAME: $("#CityDisplay"),
      WEATHER_ICON: $("#IconDisplay"),
      SKY_CONDITION: $("#SkyDisplay"),
      TEMPERATURE_VALUE: $("#TemperatureDisplay"),
      HUMIDITY_LEVEL: $("#HumidityDisplay")
   };

   const displayError = (error, display1, display2) => {

      DISPLAY.ERROR_MESSAGE.css("display", display1);
      DISPLAY.WEATHER_CONTAINER.css("display", display2);
      DISPLAY.WELCOME_MESSAGE.css("display", "none");

      if (error) console.error(error);
   };

   const displayRecentSearch = () => {

      let recentSearches = JSON.parse(localStorage.getItem("recentSearch")) || [];

      DISPLAY.SEARCH_LIST.empty();

      if (recentSearches.length === 0) DISPLAY.RECENT_SEARCH.hide();

      recentSearches.forEach(city => {
         DISPLAY.SEARCH_LIST.append(`<a>${city}</a>`);
      });

      DISPLAY.SEARCH_LIST.on("click", "a", function () {

         const city = $(this).text();

         getWeatherData(city).then(data => {

            displayWeatherInfo(data);
            displayError("", "none", "block");

         });
      });
   };

   const saveSearch = city => {

      let recentSearches = JSON.parse(localStorage.getItem("recentSearch")) || [];

      if (!recentSearches.map(c => c.toLowerCase()).includes(city.toLowerCase())) recentSearches.unshift(city);
      if (recentSearches.length > 5) recentSearches.pop();

      localStorage.setItem("recentSearch", JSON.stringify(recentSearches));
   };

   const getWeatherData = async city => {

      const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;

      const RESPONSE = await fetch(API_URL);

      RESPONSE.ok ? saveSearch(city) : console.error("Fetching Failed!");

      return await RESPONSE.json();
   };

   const getWeatherByLocation = async (lat, lon) => {

      const API_URL_LOCATION = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

      const RESPONSE = await fetch(API_URL_LOCATION);

      if (!RESPONSE.ok) console.error("Could not fetch from Location");

      return await RESPONSE.json();
   };

   const displayWeatherIcon = weatherId => {
      switch (true) {

         case weatherId >= 200 && weatherId < 300:

            DISPLAY.WEATHER_ICON.attr("src", "Images/lightning.png");
            break;

         case weatherId >= 300 && weatherId < 400:

            DISPLAY.WEATHER_ICON.attr("src", "Images/drizzle.png");
            break;

         case weatherId >= 500 && weatherId < 600:

            DISPLAY.WEATHER_ICON.attr("src", "Images/rain.png");
            break;

         case weatherId >= 600 && weatherId < 700:

            DISPLAY.WEATHER_ICON.attr("src", "Images/snow.png");
            break;

         case weatherId >= 700 && weatherId < 800:

            DISPLAY.WEATHER_ICON.attr("src", "Images/windy.png");
            break;

         case weatherId === 800:

            DISPLAY.WEATHER_ICON.attr("src", "Images/clear.png");
            break;

         case weatherId > 800:

            DISPLAY.WEATHER_ICON.attr("src", "Images/cloudy.png");
            break;
      }
   };

   const displayWeatherInfo = data => {
      const { name: cityName, main: { temp, humidity }, weather: [{ description, id }] } = data;

      const CELSIUS_TEMP = Math.floor(temp - 273.15);
      const FAHRENHEIT_TEMP = Math.floor((CELSIUS_TEMP * 9) / 5 + 32);

      DISPLAY.WELCOME_MESSAGE.css("display", "none");
      DISPLAY.WEATHER_CONTAINER.hide();
      DISPLAY.WEATHER_CONTAINER.fadeIn(500);
      DISPLAY.SKY_CONDITION.text(description);
      DISPLAY.CITY_NAME.text(cityName);
      DISPLAY.TEMPERATURE_VALUE.text(`${FAHRENHEIT_TEMP}°F | ${CELSIUS_TEMP}°C`);
      DISPLAY.HUMIDITY_LEVEL.text(`${humidity}%`);

      displayWeatherIcon(id);
   };

   INPUT.LOCATION_BTN.click(() => {

      const successCallback = async postion => {

         const { latitude, longitude } = postion.coords;

         try {

            const WEATHER_BY_LOCATION = await getWeatherByLocation(latitude, longitude);

            displayWeatherInfo(WEATHER_BY_LOCATION);

            displayError("", "none");

         } catch (error) {
            console.error(error);
            displayError("Invalid location", "block");
         }
      };

      const errorCallback = error => {
         console.error(error);
      };

      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

   });

   INPUT.SUBMIT_BTN.click(async () => {

      const CITY = INPUT.LOCATION_FIELD.val();

      displayRecentSearch()

      if (CITY) {
         try {

            const WEATHER_DATA = await getWeatherData(CITY);

            displayWeatherInfo(WEATHER_DATA);

            displayError("", "none", "block");

         } catch (error) {
            displayError(error, "block", "none");
            console.error(error);
         }
      } else {
         displayError("", "block", "none");
      }
   });

   INPUT.CLAER_BTN.click(() => {
      localStorage.clear("recentSearch");
      displayRecentSearch();
   });

   displayRecentSearch();

});
