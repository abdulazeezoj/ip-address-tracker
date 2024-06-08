const IPFY_APIKEY = "at_hX1tlu3tnptEDr1hboJmCG2iVjoxs";
const IPFY_URL = `https://geo.ipify.org/api/v2/country,city?apiKey=${IPFY_APIKEY}`;

const MAP = L.map("map-ctn", { zoomControl: false });
const markerIcon = L.icon({
  iconUrl: "./images/icon-location.svg",
  iconSize: [45, 52.2],
  iconAnchor: [45, 52.2],
});

let lastSearch;

const baseSearch = {
  ip: "192.212.174.101",
  location: {
    country: "NY",
    region: "Kaduna State",
    city: "Brooklyn",
    lat: 43.731681,
    lng: 7.414997,
    postalCode: "10001",
    timezone: "-05:00",
    geonameId: 2321638,
  },
  domains: ["abu.edu.ng"],
  as: {
    asn: 37686,
    name: "ABUZ1-AS",
    route: "196.220.66.0/23",
    domain: "forum.org.ng",
    type: "",
  },
  isp: "Space Starlink",
};

// Check if there is a last search else set baseSearch
if (!localStorage.getItem("lastSearch")) {
  localStorage.setItem("lastSearch", JSON.stringify(baseSearch));
} else if (
  localStorage.getItem("lastSearch") == "undefined" ||
  localStorage.getItem("lastSearch") == "null" ||
  localStorage.getItem("lastSearch") == ""
) {
  localStorage.setItem("lastSearch", JSON.stringify(baseSearch));
} else {
  lastSearch = JSON.parse(localStorage.getItem("lastSearch"));

  if (!lastSearch) {
    localStorage.setItem("lastSearch", JSON.stringify(baseSearch));

    lastSearch = JSON.parse(localStorage.getItem("lastSearch"));
  }
}

const searchForm = document.getElementById("search__form");
const searchInfoIP = document.getElementById("search__info_ip");
const searchInfoLocation = document.getElementById("search__info_location");
const searchInfoTimezone = document.getElementById("search__info_timezone");
const searchInfoISP = document.getElementById("search__info_isp");

/**
 * Fetches information about an IP address using the IPify API.
 * @param {string} ipAddress - The IP address to track.
 * @returns {Promise<Object>} The search data containing IP, location, and ISP information.
 * @returns {string} data.ip - The IP address.
 * @returns {Object} data.location - The location information.
 * @returns {string} data.location.city - The city name.
 * @returns {string} data.location.country - The country name.
 * @returns {string} data.location.postalCode - The postal code.
 * @returns {string} data.location.timezone - The timezone.
 * @returns {number} data.location.lat - The latitude.
 * @returns {number} data.location.lng - The longitude.
 * @returns {string} data.isp - The ISP (Internet Service Provider).
 *
 * @throws {Error} If the IP address is invalid.
 */
function trackIP(ipAddress) {
  return new Promise((resolve, reject) => {
    const xHttp = new XMLHttpRequest();
    const url = `${IPFY_URL}&ipAddress=${ipAddress}`;

    xHttp.onload = function () {
      if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText);

        resolve(data);
      } else if (this.readyState == 4 && this.status == 422) {
        reject(new Error("Invalid IP address"));
      }
    };

    xHttp.open("GET", url);

    xHttp.send();
  });
}

/**
 * Sends a GET request to retrieve information about a domain and renders the search results.
 * @param {string} domain - The domain name to track.
 *
 * @returns {Promise<Object>} data - The search data containing IP, location, and ISP information.
 * @returns {string} data.ip - The IP address.
 * @returns {Object} data.location - The location information.
 * @returns {string} data.location.city - The city name.
 * @returns {string} data.location.country - The country name.
 * @returns {string} data.location.postalCode - The postal code.
 * @returns {string} data.location.timezone - The timezone.
 * @returns {number} data.location.lat - The latitude.
 * @returns {number} data.location.lng - The longitude.
 * @returns {string} data.isp - The ISP (Internet Service Provider).
 *
 * @throws {Error} If the domain name is invalid.
 */
function trackDomain(domain) {
  return new Promise((resolve, reject) => {
    const xHttp = new XMLHttpRequest();
    const url = `${IPFY_URL}&domain=${domain}`;

    xHttp.onload = function () {
      if (this.readyState == 4 && this.status == 200) {
        let data = JSON.parse(this.responseText);

        resolve(data);
      } else if (this.readyState == 4 && this.status == 422) {
        reject(new Error("Invalid domain name"));
      }
    };

    xHttp.open("GET", url);

    xHttp.send();
  });
}

/**
 * Renders the search results on the page.
 *
 * @param {Object} data - The search data containing IP, location, and ISP information.
 * @param {string} data.ip - The IP address.
 * @param {Object} data.location - The location information.
 * @param {string} data.location.city - The city name.
 * @param {string} data.location.country - The country name.
 * @param {string} data.location.postalCode - The postal code.
 * @param {string} data.location.timezone - The timezone.
 * @param {number} data.location.lat - The latitude.
 * @param {number} data.location.lng - The longitude.
 * @param {string} data.isp - The ISP (Internet Service Provider).
 *
 * @throws {Error} If data is not found or location information is not found.
 */
function renderSearch(data) {
  try {
    let { ip, location, isp } = data;

    if (!ip || !location || !isp) throw new Error("Data not found");

    let { city, country, postalCode, timezone, lat, lng } = location;

    if (!city || !country || !postalCode || !timezone || !lat || !lng)
      throw new Error("Location information not found");

    // Render search information
    renderSearchInfo(ip, city, country, postalCode, timezone, isp);

    // Render map
    renderMap(lat, lng);
  } catch (error) {
    console.log("renderSearch: ", error);
  }
}

/**
 * Renders the search information on the page.
 *
 * @param {string} ip - The IP address.
 * @param {string} city - The city name.
 * @param {string} country - The country name.
 * @param {string} postalCode - The postal code.
 * @param {string} timezone - The timezone.
 * @param {string} isp - The ISP (Internet Service Provider).
 *
 * @throws {Error} If IP address, location, or ISP is not found in the data object.
 */
function renderSearchInfo(ip, city, country, postalCode, timezone, isp) {
  try {
    // Set IP
    searchInfoIP.textContent = ip;

    // Set Location
    searchInfoLocation.textContent = `${city}, ${country} ${postalCode}`;

    // Set Timezone
    searchInfoTimezone.textContent = `UTC ${timezone}`;

    // Set ISP
    searchInfoISP.textContent = isp;
  } catch (error) {
    console.log("renderSearchInfo: ", error);
  }
}

/**
 * Renders a map with the specified latitude and longitude.
 *
 * @param {number} lat - The latitude of the map center.
 * @param {number} lng - The longitude of the map center.
 *
 * @throws {Error} If latitude or longitude is not found.
 */
function renderMap(lat, lng) {
  try {
    // Render new map
    MAP.setView([lat, lng], 17);

    // Add tile layer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(MAP);

    // Add marker
    L.marker([lat, lng], { icon: markerIcon }).addTo(MAP);
  } catch (error) {
    console.log("renderMap: ", error);
  }
}

searchForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  try {
    const searchFormText = this["search__form_text"].value;
    let searchData;

    if (searchFormText) {
      if (searchFormText.match(/^[0-9.]+$/)) {
        searchData = await trackIP(searchFormText);
      } else {
        searchData = await trackDomain(searchFormText);
      }

      let { ip, location, isp } = searchData;

      if (!ip || !location || !isp) throw new Error("Invalid search results");

      let { city, country, postalCode, timezone, lat, lng } = location;

      if (!city || !country || !postalCode || !timezone || !lat || !lng)
        throw new Error("Location information not found");

      // Save last search
      lastSearch = { ...searchData };
      localStorage.setItem("lastSearch", JSON.stringify(lastSearch));

      // Render search information
      renderSearch(searchData);

      // Clear search form
      this.reset();
    }
  } catch (error) {
    // Alert user
    alert(error.message);
  }
});

// Check if there is a last search
if (lastSearch) {
  renderSearch(lastSearch);
} else {
  renderSearch(baseSearch);
}
