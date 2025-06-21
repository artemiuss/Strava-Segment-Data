
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('https://www.strava.com/segments/')) {
    // Extract the segment ID from the URL
    const segmentId = tab.url.match(/\/segments\/(\d+)/)[1];

    // Construct the URL for fetching the segment history
    const historyUrl = `https://www.strava.com/athlete/segments/${segmentId}/history`;

    // Fetch the segment history data
    fetch(historyUrl)
      .then(response => response.json())
      .then(data => {
        // Extract the required values from the segment node
        const segment = data.segment || {};
        const createdAt = segment.created_at || "Unknown";
        const createdById = segment.created_by_id || "Unknown";

        // Fetch the athlete details using the created_by_id
        const athleteUrl = `https://www.strava.com/athletes/${createdById}`;
        return fetch(athleteUrl)
          .then(athleteResponse => athleteResponse.text())
          .then(athleteHtml => {
            // Send the raw athlete HTML, createdAt, and createdById to the content script
            chrome.tabs.sendMessage(tabId, { createdAt, createdById, athleteHtml });
          });
      })
      .catch(error => {
        console.error('Error fetching segment or athlete data:', error);
      });
  }
});
