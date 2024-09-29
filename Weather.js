$(document).ready(function () {
   const INPUT = {
      LOCATION_FIELD: $("#CityInput"),
      SUBMIT_BTN: $("#CityBtn"),
      LOCATION_BTN: $("#locationDot"),
      FAHRENHEIT_BTN: $("#FahrenheitBtn"),
      CELSIUS_BTN: $("#CelsiusBtn"),
      CONVERT: $("#ConvertBtn")
   };

   const DISPLAY = {
      WELCOME_MESSAGE: $("#WelcomeMsg"),
      RECENT_SEARCHES: $(`.last-search`),
      ERROR_MESSAGE: $(`.invalid-search`),
      WEATHER_CONTAINER: $("#MainContainer"),
      CITY_NAME: $("#CityDisplay"),
      WEATHER_ICON: $("#IconDisplay"),
      SKY_CONDITION: $("#SkyDisplay"),
      TEMPERATURE_VALUE: $("#TemperatureDisplay"),
      HUMIDITY_LEVEL: $("#HumidityDisplay")
   };

   const API_KEY = "58aee28527bdf3c3ee2286a85c98202e";

   INPUT.SUBMIT_BTN.click(async () => {
      const CITY = INPUT.LOCATION_FIELD.val();

      if (CITY) {
         try {
            const WEATHER_DATA = await getWeatherData(CITY);
            displayWeatherInfo(WEATHER_DATA);
            displayError("", "none");
         } catch (error) {
            console.error(`Catch: ${error}`);
            displayError(error, "block");
         }
      } else {
         displayError("", "block");
         DISPLAY.WEATHER_CONTAINER.css("display", "none");
      }
   });

   async function getWeatherData(city) {
      const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;

      const RESPONSE = await fetch(API_URL);

      if (!RESPONSE.ok) {
         console.error("Could not fetch");
      }

      return await RESPONSE.json();
   }

   function displayWeatherInfo(data) {
      const {
         name: cityName,
         main: { temp, humidity },
         weather: [{ description, id }]
      } = data;

      DISPLAY.WELCOME_MESSAGE.css("display", "none");
      DISPLAY.WEATHER_CONTAINER.css("display", "block");
      DISPLAY.SKY_CONDITION.text(description.charAt(0).toUpperCase() + description.slice(1));
      DISPLAY.CITY_NAME.text(cityName);
      DISPLAY.TEMPERATURE_VALUE.text(`${Math.ceil(temp - 273.15)}°C`);
      DISPLAY.HUMIDITY_LEVEL.text(`${humidity}%`);

      displayWeahterIcon(id);

      INPUT.CONVERT.click(() => {
         let celsiusTemp = Math.ceil(temp - 273.15);

         if (INPUT.FAHRENHEIT_BTN.is(":checked")) {
            celsiusTemp = (celsiusTemp * 9) / 5 + 32;
            DISPLAY.TEMPERATURE_VALUE.text(`${celsiusTemp}°F`);
         } else if (INPUT.CELSIUS_BTN.is(":checked")) {
            celsiusTemp = Math.ceil(temp - 273.15);
            DISPLAY.TEMPERATURE_VALUE.text(`${celsiusTemp}°C`);
         }
      });
   }

   function displayWeahterIcon(weatherId) {
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
   }

   function displayError(error, dispaly) {
      DISPLAY.ERROR_MESSAGE.css("display", dispaly);
      DISPLAY.WELCOME_MESSAGE.css("display", "none");
      if (error) {
         console.error(error);
      }
   }
});
