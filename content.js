const callAPI = async () => {

  const txt = document.documentElement.innerHTML;
  const username = window.location.pathname.replace(/^\/|\/$/g, '');
  console.log({ username })

  let cookie = {};
  document.cookie.split(';').forEach(function (el) {
    let [key, value] = el.split('=');
    cookie[key.trim()] = value;
  })


  const appIDMatches = txt.match(/(APP_ID":")\w+/)
  const csrf = cookie['csrftoken']
  const appID = appIDMatches?.[0].substring(9)
  const req = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
    headers: {
      "X-Csrftoken": csrf,
      "X-Ig-App-Id": appID
    }
  })

  if (req.status !== 200) {
    console.log({ headers: req.headers, body: req.body })
    return
  }

  const result = await req.json();
  console.log({ result })
  insertData(result?.data?.user)
}

const loadDocument = async function () {
  const main = document.querySelector("main");
  const header = main?.querySelector("header");
  const section = header?.querySelector("section");

  if (section) {

    const button = document.createElement("button");
    button.className = "button is-primary";
    button.textContent = `+   Add Lead`;
    button.setAttribute('style', `
      background-color: #9d49fe;
      padding: 0.8rem 1.3rem;
      border-radius: 0.5rem;
      border: none;
      color: white;
      font-weight: medium;
      font-size: 1rem;
      margin: 0.5rem 0;
      width: 150px;
      cursor: pointer;
    `)

    button.onclick = async function (e) {
      button.classList.add("is-loading");
      await callAPI()
      button.classList.remove("is-loading");
    };
    section.insertBefore(button, section.firstChild);
  }

  var link = document.createElement("link");
  link.href = "https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css";
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);

}

setTimeout(() => loadDocument(), 3000)

const tags = [
  "Solopreneur",
  "Coach",
  "Creator",
  "Agency",
  "Founder",
  "Endorsement",
  "Newsletter",
  "Guide",
  "Freelancer",
]

const industry = [
  "Fitness",
  "Creator",
  "Design",
  "Music",
  "Notion",
  "Marketing",
  "Startup",
  "Tech",
  "Jokes",
  "Beauty",
  "Lifestyle",
  "Freelancer",
  "Corporate",
  "Finance",
  "YouTuber",
]

const insertData = function (data) {

  const main = document.querySelector("main");
  const header = main.querySelector("header");

  if (header) {
    const container = document.createElement("div");
    container.setAttribute('style', `
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      background-color: #ffffff;
      border-radius: 1rem;
      color: black;
      width: 100%;
      box-sizing: border-box;
      margin-top: 3rem;
      `)


    container.innerHTML = `
      <div class="field">
        <label class="label">Name</label>
        <div class="control">
        <input class="input" type="text" id="td-lead-name" value="${data.full_name}">
        </div>
      </div>

      <div class="field">
        <label class="label">Email</label>
        <div class="control">
        <input class="input" type="email" id="td-lead-email" value="${data.business_email}">
        </div>
      </div>

      <div class="field">
        <label class="label">Link in bio</label>
        <div class="control">
          <div class="select">
            <select id="td-lead-links">
              ${data.bio_links?.map(link => `<option>${link.url}</option>`).join("")}
            </select>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">Tags</label>
        <div class="control" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${tags.map(tag => `<label class="checkbox" style="color: black;">
            <input name="td-lead-tags" type="checkbox" style="margin-right: 2px" value=${tag}>
            ${tag}
          </label>`).join("")}
        </div>
      </div>

      <div class="field">
        <label class="label">Industry</label>
        <div class="control" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${industry.map(id => `<label class="checkbox" style="color: black;">
            <input name="td-lead-industry" type="checkbox" style="margin-right: 2px" value=${id}>
            ${id}
          </label>`).join("")}
        </div>
      </div>
    `


    header.parentNode.insertBefore(container, header.nextSibling);

    const button = document.createElement("button");
    button.textContent = `Submit Lead`;
    button.className = "button is-link";
    button.onclick = async function () {
      button.classList.add("is-loading");
      const name = document.getElementById("td-lead-name").value;
      const email = document.getElementById("td-lead-email").value;
      const link = document.getElementById("td-lead-links").value;

      const tagsCheckboxes = document.querySelectorAll('input[name="td-lead-tags"]');
      const tags = Array.from(tagsCheckboxes, (checkbox) => checkbox.checked ? checkbox.value : null).filter(x => !!x);


      const idCheckboxes = document.querySelectorAll('input[name="td-lead-industry"]');
      const industry = Array.from(idCheckboxes, (checkbox) => checkbox.checked ? checkbox.value : null).filter(x => !!x);

      const reqBody = {
        data,
        leadProfile: {
          name,
          email,
          link,
          tags,
          industry
        }
      }

      try {
        const resp = await fetch("http://localhost:3002/api/instagram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(reqBody)
        })

        const result = await resp.json();
        if (!resp.status === 200) {
          console.log(result)
          throw new Error("Fail to submit lead");
        }
        if (!result.url) {
          console.log(result)
          throw new Error("Fail to submit lead, lead url does not exist");
        }

        container.innerHTML = `
          <div style="color: black; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
           ✅ Lead Submitted
          </div>
          <a href="${result.url}" target="_blank">
           <button class="button is-success">View Lead →</button>
          </a>
        `
      } catch (e) {
        const errorMsg = document.createElement("div");
        errorMsg.textContent = "Error submitting lead. See console log for details";
        errorMsg.style.color = "red";
        container.appendChild(errorMsg);
        console.error(e);
      }

      button.classList.remove("is-loading");
    }
    container.appendChild(button);
  }
}

