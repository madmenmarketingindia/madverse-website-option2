(function () {
  "use strict";
  var form = document.querySelector("[data-application-form]");
  var roleSelect = document.querySelector("[data-role-select]");
  var error = document.querySelector("[data-form-error]");
  if (!form || !roleSelect) return;

  var roleDetails = {
    "Senior Copywriter": { department: "Creative", location: "Delhi NCR", type: "Full time", experience: "3–5 years", summary: "Shape campaign ideas, brand voices and sharp copy across platforms with strategy and design teams." },
    "Visual Designer": { department: "Creative", location: "Delhi NCR", type: "Full time", experience: "2–4 years", summary: "Turn brand thinking into distinctive visual systems, campaigns and digital experiences." },
    "Brand Strategist": { department: "Strategy", location: "Delhi NCR", type: "Full time", experience: "3–5 years", summary: "Find the human and commercial truth that gives brands a clearer position and a stronger path to growth." },
    "Performance Marketing Manager": { department: "Growth", location: "Delhi NCR", type: "Full time", experience: "4–6 years", summary: "Plan, optimise and scale measurable growth programs across paid channels, creative and data." },
    "Front-end Developer": { department: "Technology", location: "Delhi NCR", type: "Full time", experience: "2–5 years", summary: "Build fast, accessible and expressive digital experiences in close partnership with design." },
    "Motion Designer": { department: "Creative", location: "Delhi NCR", type: "Full time", experience: "2–4 years", summary: "Bring brands and stories to life through motion systems, films, social content and digital craft." },
    "Open Application": { department: "Across Madverse", location: "Delhi NCR", type: "Let’s talk", experience: "Any level", summary: "Do not see your exact title? Show us the craft, perspective and energy you could bring to the collective." }
  };

  var detailFields = {
    title: document.querySelector("[data-role-title]"),
    department: document.querySelector("[data-role-department]"),
    location: document.querySelector("[data-role-location]"),
    type: document.querySelector("[data-role-type]"),
    experience: document.querySelector("[data-role-experience]"),
    summary: document.querySelector("[data-role-summary]")
  };

  var jobFields = {
    title: document.querySelector("[data-job-title]"),
    department: document.querySelector("[data-job-department]"),
    location: document.querySelector("[data-job-location]"),
    type: document.querySelector("[data-job-type]"),
    experience: document.querySelector("[data-job-experience]"),
    overview: document.querySelector("[data-job-overview]"),
    responsibilities: document.querySelector("[data-job-responsibilities]"),
    requirements: document.querySelector("[data-job-requirements]")
  };

  var jobContent = {
    "Senior Copywriter": { overview: "Turn strategy into memorable ideas, distinctive brand voices and copy people actually want to read, watch and share.", responsibilities: ["Develop campaign platforms, scripts, social ideas and brand copy.", "Partner closely with art directors, strategists and designers.", "Present and defend creative thinking with clarity.", "Maintain quality from first thought through final execution."], requirements: ["A strong portfolio of conceptual and crafted writing.", "3–5 years of agency or brand-side experience.", "Confidence writing across formats and tones.", "Sharp communication, curiosity and collaborative instincts."] },
    "Visual Designer": { overview: "Create bold, coherent visual work that helps brands show up with clarity across campaigns, content and digital experiences.", responsibilities: ["Translate strategy and concepts into visual systems.", "Design campaign, social, presentation and digital assets.", "Collaborate with copy, motion and production specialists.", "Protect craft and consistency through final delivery."], requirements: ["A portfolio showing strong typography, layout and ideas.", "2–4 years of relevant design experience.", "Proficiency with core Adobe and collaborative design tools.", "The ability to explain choices and respond well to feedback."] },
    "Brand Strategist": { overview: "Find the cultural, human and commercial insight that gives brands a sharper position and teams a clearer direction.", responsibilities: ["Lead research, category analysis and audience thinking.", "Build positioning, propositions and communication strategy.", "Turn complexity into focused, inspiring briefs.", "Work with creative and growth teams through execution."], requirements: ["3–5 years in brand, communication or cultural strategy.", "Strong analytical, writing and presentation skills.", "An instinct for culture, behaviour and business.", "Confidence facilitating conversations with teams and clients."] },
    "Performance Marketing Manager": { overview: "Connect data, media and creative to build performance programs that learn quickly and compound growth over time.", responsibilities: ["Plan and manage paid campaigns across key platforms.", "Own measurement, optimisation and reporting rhythms.", "Translate performance signals into creative action.", "Work with strategy and content teams on growth experiments."], requirements: ["4–6 years managing meaningful paid-media budgets.", "Strong command of platform, analytics and attribution tools.", "Commercial thinking with excellent attention to detail.", "Clear communication of insights and recommendations."] },
    "Front-end Developer": { overview: "Build expressive, accessible and high-performing digital experiences where design intent survives all the way into the browser.", responsibilities: ["Develop responsive interfaces from design systems.", "Create reusable, maintainable front-end components.", "Improve accessibility, performance and interaction quality.", "Collaborate closely with designers and back-end teams."], requirements: ["2–5 years of modern front-end development experience.", "Strong HTML, CSS and JavaScript fundamentals.", "Experience with responsive design and web accessibility.", "A craft mindset and care for small interaction details."] },
    "Motion Designer": { overview: "Give ideas rhythm, character and emotional force across brand systems, campaigns, films and social content.", responsibilities: ["Create motion concepts, storyboards and finished animation.", "Build adaptable motion languages for brands.", "Collaborate with design, copy and production teams.", "Take work from early frames through final delivery."], requirements: ["A strong motion portfolio with conceptual range.", "2–4 years of relevant experience.", "Fluency in After Effects and related production tools.", "Strong timing, composition and storytelling instincts."] },
    "Open Application": { overview: "Your exact role may not be listed, but exceptional craft and a strong point of view always deserve a conversation.", responsibilities: ["Tell us the kind of problems you solve best.", "Show work that represents your standards and thinking.", "Explain where you want your craft to grow next.", "Help us see the opportunity we may not have named yet."], requirements: ["A clear portfolio, CV or body of relevant work.", "A specific point of view on what you could contribute.", "Curiosity, ownership and respect for collaboration.", "An honest introduction rather than a generic application."] }
  };

  function renderList(list, items) {
    if (!list) return;
    list.textContent = "";
    items.forEach(function (item) { var li = document.createElement("li"); li.textContent = item; list.appendChild(li); });
  }

  function updateRoleDetails(role) {
    var details = roleDetails[role];
    if (!details) {
      if (detailFields.title) detailFields.title.textContent = "Choose a role";
      ["department", "location", "type", "experience"].forEach(function (key) { if (detailFields[key]) detailFields[key].textContent = "—"; });
      if (detailFields.summary) detailFields.summary.textContent = "Select a position in the form to see its details.";
      if (jobFields.title) jobFields.title.textContent = "Choose a role";
      ["department", "location", "type", "experience"].forEach(function (key) { if (jobFields[key]) jobFields[key].textContent = "—"; });
      if (jobFields.overview) jobFields.overview.textContent = "Select a position to read the complete role description.";
      renderList(jobFields.responsibilities, ["Role responsibilities will appear here."]);
      renderList(jobFields.requirements, ["Role requirements will appear here."]);
      return;
    }
    if (detailFields.title) detailFields.title.textContent = role;
    ["department", "location", "type", "experience", "summary"].forEach(function (key) { if (detailFields[key]) detailFields[key].textContent = details[key]; });
    if (jobFields.title) jobFields.title.textContent = role;
    ["department", "location", "type", "experience"].forEach(function (key) { if (jobFields[key]) jobFields[key].textContent = details[key]; });
    var content = jobContent[role];
    if (content) {
      if (jobFields.overview) jobFields.overview.textContent = content.overview;
      renderList(jobFields.responsibilities, content.responsibilities);
      renderList(jobFields.requirements, content.requirements);
    }
  }

  var requestedRole = new URLSearchParams(window.location.search).get("role");
  if (requestedRole && Array.prototype.some.call(roleSelect.options, function (option) { return option.value === requestedRole; })) roleSelect.value = requestedRole;
  updateRoleDetails(roleSelect.value);
  roleSelect.addEventListener("change", function () { updateRoleDetails(roleSelect.value); });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      if (error) error.hidden = false;
      form.reportValidity();
      return;
    }
    if (error) error.hidden = true;
    var data = new FormData(form);
    var subject = "Job application — " + data.get("role") + " — " + data.get("name");
    var body = ["Hello Madverse team,", "", "I would like to apply for the " + data.get("role") + " role.", "", "Name: " + data.get("name"), "Email: " + data.get("email"), "Phone: " + data.get("phone"), "Location: " + data.get("location"), "Experience: " + data.get("experience"), "Notice period: " + (data.get("notice") || "Not specified"), "CV / Portfolio: " + data.get("portfolio"), "", "Why Madverse:", data.get("message"), "", "Thank you."];
    window.location.href = "mailto:team@madmen.in?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body.join("\n"));
  });
})();
