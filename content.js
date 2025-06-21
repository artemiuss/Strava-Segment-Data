chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { createdAt, createdById, athleteHtml } = message;

  // Create a parser to process the athlete HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(athleteHtml, 'text/html');

  // Extract athlete name from <h1 class="text-title1 athlete-name">
  let athleteName = doc.querySelector('h1.athlete-name')?.textContent || "Unknown";

  // Extract athlete image: find first occurrence of link to large.jpg in any attribute in any tag inside <div class="page container">
  let athleteImage = "";
  const pageContainer = doc.querySelector('div.page.container');
  if (pageContainer) {
    const allElements = pageContainer.querySelectorAll('*');
    const largeJpgRegex = /https:\/\/[^"'\s>]+large\.jpg/;

    outer: for (let el of allElements) {
      if (!el.hasAttributes()) continue;
      for (let attr of el.attributes) {
        const match = attr.value.match(largeJpgRegex);
        if (match) {
          athleteImage = match[0];
          break outer;
        }
      }
    }
  }

  // Fallback URL in case no athlete-specific URL is found
  let athleteUrl = `https://www.strava.com/athletes/${createdById}`;

  // Format created_at date to local time and format using the user's locale
  const localCreatedAt = new Date(createdAt).toLocaleString(navigator.language, {
    dateStyle: 'full',  // Full date format (e.g., "Wednesday, September 9, 2024")
    timeStyle: 'short'  // Short time format (e.g., "14:54")
  });

  // Create the notification container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '10px';  // Positioned at the bottom
  container.style.right = '10px';   // Positioned on the right
  container.style.backgroundColor = 'rgba(0,0,0,0.8)';
  container.style.color = 'white';
  container.style.padding = '10px';
  container.style.borderRadius = '5px';
  container.style.display = 'flex';
  container.style.alignItems = 'center'; // Align content horizontally
  container.style.zIndex = '10000';

  // Create the image element with circular styling
  if (athleteImage !== "") {
    image = document.createElement('img');
    image.src = athleteImage;
    image.style.width = '50px';
    image.style.height = '50px';
    image.style.borderRadius = '50%';
    image.style.marginRight = '10px';
    image.style.cursor = 'pointer';
    image.onclick = () => {
      window.open(athleteUrl, '_blank');
    };
  }
  else {
    image = null; // No image found
  }

  // Create the text container for name and time
  const textContainer = document.createElement('div');

  // Create formatted text: "Segment created:"
  const segmentCreatedText = document.createElement('div');
  segmentCreatedText.textContent = "Segment created:";

  // Create formatted text for the athlete name with a link
  const athleteNameText = document.createElement('a');
  athleteNameText.href = athleteUrl;
  athleteNameText.textContent = athleteName;
  athleteNameText.style.color = 'white';
  athleteNameText.style.fontWeight = 'bold';
  athleteNameText.style.textDecoration = 'none';
  athleteNameText.style.cursor = 'pointer';
  athleteNameText.target = '_blank';

  // Create formatted date text: date and time in local format
  const createdAtText = document.createElement('div');
  createdAtText.textContent = localCreatedAt;

  // Append text to the text container
  textContainer.appendChild(segmentCreatedText);
  textContainer.appendChild(athleteNameText);
  textContainer.appendChild(createdAtText);

  // Append the image and text container to the main container
  if (image) {
    container.appendChild(image); // Image on the left
  }
  container.appendChild(textContainer); // Text on the right

  // Inject the notification into the page
  document.body.appendChild(container);

  // Log the extracted details for debugging
  console.log("Athlete Name:", athleteName);
  console.log("Athlete Image URL:", athleteImage);

  // Send response with extracted data
  sendResponse({ athleteName, athleteImage });
});
