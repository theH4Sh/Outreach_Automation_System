const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function sendDM(username, message) {
  // go to profile
  window.location.href = `https://www.instagram.com/${username}/`;

  await delay(5000);

  // click Message button
  const buttons = [...document.querySelectorAll('div[role="button"]')];
  const messageBtn = buttons.find(btn => btn.innerText.toLowerCase() === 'message');

  if (!messageBtn) {
    console.log('Message button not found');
    return;
  }

  messageBtn.click();

  await delay(4000);

  // find textbox
  const input = document.querySelector('[contenteditable="true"]');

  if (!input) {
    console.log('Input not found');
    return;
  }

  input.focus();

  // type message
  input.innerHTML = message;

  await delay(500);

  // trigger enter
  input.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Enter',
    bubbles: true
  }));

  console.log('DM sent');
}