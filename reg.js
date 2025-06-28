// Global counters for family and student codes within the current session
let familyCounter = 1;
let studentCounter = 1; // This counter will be used for overall student numbering

// Auto-generate unique family account code
const generateFamilyCode = () => {
  // Pad with leading zeros to ensure at least 3 digits
  const code = `FC3-${String(familyCounter).padStart(3, '0')}`;
  familyCounter++; // Increment for the next family (for future page loads in a new session, this resets)
  return code;
};

// Generate student code based on a global student series counter
const generateStudentCode = () => {
  // Use the global studentCounter for the sequence
  // Pad with leading zeros to ensure at least 4 digits
  const code = `FA3-${String(studentCounter).padStart(4, '0')}`;
  studentCounter++; // Increment for the next student
  return code;
};

let currentFamilyAccount = ""; // To store the generated family code for the current session

// Define grade fees as per the requirements
const gradeFeeMap = {
  'kg1': 50,
  'kg2': 100,
  'grade 1': 150,
  'grade 2': 200,
  'grade 3': 250,
  'grade 4': 300,
  'grade 5': 350,
  'grade 6': 400,
  'grade 7': 450,
  'grade 8': 500,
  'grade 9': 550,
  'grade 10': 600,
  'grade 11': 650,
  'grade 12': 700
};

document.addEventListener("DOMContentLoaded", () => {
  // Generate and display the family account ID and registration date on page load
  currentFamilyAccount = generateFamilyCode();
  document.getElementById("accountId").innerText = currentFamilyAccount;
  document.getElementById("registerDate").innerText = new Date().toLocaleDateString();

  // Event listener for the "Include Second Parent" checkbox
  document.getElementById("secondParentToggle").addEventListener("change", function () {
    document.getElementById("secondParentSection").style.display = this.checked ? "block" : "none";
  });

  // Event listener for the "Payment Method" dropdown to update account number
  document.getElementById("paymentMethod").addEventListener("change", function () {
    const accountMap = {
      "Commercial Bank": "1001001010",
      "EBBIR": "EB001123456",
      "Kaafi": "KF22334455",
      "eSahal": "ES99887766"
    };
    document.getElementById("accountNumber").innerText = accountMap[this.value] || "";
  });
});

// Function to transition from Parent Section to Student Section
function goToStudentSection() {
  const countInput = document.getElementById("numStudents");
  const studentCount = parseInt(countInput.value);

  // Validate the number of students entered
  if (!studentCount || studentCount < 1) {
    alert("Please enter a valid number of students (1 or more).");
    return;
  }

  // Hide the parent section and prepare the student form section
  document.getElementById("parentSection").style.display = "none";
  const studentForm = document.getElementById("studentForm");
  studentForm.innerHTML = ""; // Clear any previously generated student fields
  studentForm.style.display = "block"; // Show the student form section

  // Dynamically generate input fields for each student
  for (let i = 0; i < studentCount; i++) {
    const studentCode = generateStudentCode(); // Generate a unique code for each student

    studentForm.innerHTML += `
      <fieldset>
        <legend>Student ${i + 1} - ${studentCode}</legend>
        <label>Full Name:</label><input type="text" class="s_name" required />
        <label>Age:</label><input type="number" class="s_age" required />
        <label>Grade:</label>
        <select class="s_grade" required>
          <option value="">Select Grade</option>
          <option value="kg1">KG1</option>
          <option value="kg2">KG2</option>
          <option value="grade 1">Grade 1</option>
          <option value="grade 2">Grade 2</option>
          <option value="grade 3">Grade 3</option>
          <option value="grade 4">Grade 4</option>
          <option value="grade 5">Grade 5</option>
          <option value="grade 6">Grade 6</option>
          <option value="grade 7">Grade 7</option>
          <option value="grade 8">Grade 8</option>
          <option value="grade 9">Grade 9</option>
          <option value="grade 10">Grade 10</option>
          <option value="grade 11">Grade 11</option>
          <option value="grade 12">Grade 12</option>
        </select>
        <label>Sex:</label>
        <select class="s_sex" required>
          <option>Male</option>
          <option>Female</option>
        </select>
        <label>Transport Needed?</label>
        <select class="s_transport" required>
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
        <input type="hidden" class="s_code" value="${studentCode}" />
      </fieldset>
    `;
  }

  // Add "Review Payment" button to proceed to payment summary
  const nextBtn = document.createElement("button");
  nextBtn.innerText = "Review Payment";
  nextBtn.type = "button";
  nextBtn.onclick = calculateFees;
  studentForm.appendChild(nextBtn);

  // Add "Back" button to return to the parent information section
  const backBtn = document.createElement("button");
  backBtn.innerText = "Back";
  backBtn.type = "button";
  backBtn.style.marginLeft = "10px"; // Add some spacing between buttons
  backBtn.onclick = () => {
    studentForm.style.display = "none";
    document.getElementById("parentSection").style.display = "block";
  };
  studentForm.appendChild(backBtn);
}

// Function to calculate fees for all students and display payment summary
function calculateFees() {
  const names = document.querySelectorAll(".s_name");
  const grades = document.querySelectorAll(".s_grade");
  const transport = document.querySelectorAll(".s_transport");
  const codes = document.querySelectorAll(".s_code");

  const paymentDiv = document.getElementById("paymentDetails");
  paymentDiv.innerHTML = ""; // Clear previous payment summary

  let totalAll = 0;
  let studentsDataForFees = []; // Temporary array to hold student data for fee calculation and discount application

  // Calculate base fees for each student
  names.forEach((nameInput, i) => {
    let reg = 100;
    let exam = 50;
    let transportFee = transport[i].value === "Yes" ? 70 : 0;
    let gradeFee = 0;

    const gradeKey = grades[i].value.toLowerCase().trim(); // Get the selected grade value

    // Look up grade fee from the map
    gradeFee = gradeFeeMap[gradeKey] || 0;

    if (gradeFee === 0 && gradeKey !== "") {
      // Alert if a grade was selected but its fee wasn't found in the map
      alert(`Warning: Unknown grade "${grades[i].value}" for student ${i + 1}. Grade fee set to 0.`);
    }

    studentsDataForFees.push({
      originalIndex: i, // Store original index to maintain order in display
      name: nameInput.value,
      code: codes[i].value,
      reg: reg,
      exam: exam,
      transportFee: transportFee,
      gradeFee: gradeFee,
      // Store total before any discounts are applied
      totalBeforeDiscount: reg + exam + transportFee + gradeFee
    });
  });

  // Apply family discount if 5 or more students are registered
  if (studentsDataForFees.length >= 5) {
    let minGradeFee = Infinity;
    let indexOfLowestGradeStudent = -1;

    // Find the student with the lowest base grade fee
    studentsDataForFees.forEach((student, index) => {
      // We are comparing 'gradeFee' not total, as requested.
      if (student.gradeFee < minGradeFee) {
        minGradeFee = student.gradeFee;
        indexOfLowestGradeStudent = index;
      }
    });

    if (indexOfLowestGradeStudent !== -1) {
      // Make the identified student free of Reg, Exam, and Grade fees
      studentsDataForFees[indexOfLowestGradeStudent].reg = 0;
      studentsDataForFees[indexOfLowestGradeStudent].exam = 0;
      studentsDataForFees[indexOfLowestGradeStudent].gradeFee = 0;
      // Update their total to reflect only transport fee (if any)
      studentsDataForFees[indexOfLowestGradeStudent].totalBeforeDiscount = studentsDataForFees[indexOfLowestGradeStudent].transportFee;
    }
  }

  // Display fees for each student and calculate grand total
  studentsDataForFees.forEach(student => {
    // Calculate the final total after potential discounts
    const currentTotal = student.reg + student.exam + student.transportFee + student.gradeFee;
    totalAll += currentTotal;

    let discountAppliedText = '';
    // Add a "FREE" tag if this student received the discount
    // Check if their fee components (reg, exam, gradeFee) are zero and they were part of a large family
    if (studentsDataForFees.length >= 5 && student.reg === 0 && student.exam === 0 && student.gradeFee === 0) {
        discountAppliedText = ' <span style="color: green; font-weight: bold;">(FREE - Family Discount!)</span>';
    }

    paymentDiv.innerHTML += `
      <div>
        <strong>${student.code}</strong> - ${student.name}${discountAppliedText}<br>
        Reg: $${student.reg}, Exam: $${student.exam}, Transport: $${student.transportFee}, Grade Fee: $${student.gradeFee}<br>
        <strong>Total: $${currentTotal}</strong>
      </div><br>
    `;
  });

  // Display the grand total for all students
  paymentDiv.innerHTML += `<h3>Grand Total: $${totalAll}</h3>`;

  // Hide student form and show payment section
  document.getElementById("studentForm").style.display = "none";
  document.getElementById("paymentSection").style.display = "block";
}


// Function to submit all collected data to Google Apps Script
function submitAllData() {
  // Collect parent/guardian information
  const guardians = [{
    name: document.getElementById("p1_name").value,
    relation: document.getElementById("p1_relation").value,
    phone: document.getElementById("p1_phone").value,
    area: document.getElementById("p1_area").value
  }];

  // Add second parent if checkbox is checked
  if (document.getElementById("secondParentToggle").checked) {
    guardians.push({
      name: document.getElementById("p2_name").value,
      relation: document.getElementById("p2_relation").value,
      phone: document.getElementById("p2_phone").value,
      area: document.getElementById("p2_area").value
    });
  }

  let students = []; // Final array to hold student data for submission
  const names = document.querySelectorAll(".s_name");
  const ages = document.querySelectorAll(".s_age");
  const grades = document.querySelectorAll(".s_grade");
  const sex = document.querySelectorAll(".s_sex");
  const transport = document.querySelectorAll(".s_transport");
  const codes = document.querySelectorAll(".s_code");

  let studentsDataForSubmission = []; // Temporary array for calculating fees before final payload

  // Calculate base fees for each student for submission payload
  names.forEach((nameInput, i) => {
    let reg = 100;
    let exam = 50;
    let transportFee = transport[i].value === "Yes" ? 70 : 0;
    let gradeFee = 0;

    const gradeKey = grades[i].value.toLowerCase().trim();
    gradeFee = gradeFeeMap[gradeKey] || 0;

    if (gradeFee === 0 && gradeKey !== "") {
      console.warn(`Unknown grade "${grades[i].value}" for student ${i + 1} during submission. Grade fee set to 0.`);
    }

    studentsDataForSubmission.push({
      originalIndex: i,
      studentCode: codes[i].value,
      name: nameInput.value,
      age: ages[i].value,
      grade: grades[i].value,
      sex: sex[i].value,
      transport: transport[i].value,
      reg: reg,
      exam: exam,
      transportFee: transportFee,
      gradeFee: gradeFee,
      totalFee: reg + exam + transportFee + gradeFee // Total before discount
    });
  });

  // Apply discount if 5 or more students (same logic as calculateFees)
  if (studentsDataForSubmission.length >= 5) {
    let minGradeFee = Infinity;
    let indexOfLowestGradeStudent = -1;

    studentsDataForSubmission.forEach((student, index) => {
      if (student.gradeFee < minGradeFee) {
        minGradeFee = student.gradeFee;
        indexOfLowestGradeStudent = index;
      }
    });

    if (indexOfLowestGradeStudent !== -1) {
      studentsDataForSubmission[indexOfLowestGradeStudent].reg = 0;
      studentsDataForSubmission[indexOfLowestGradeStudent].exam = 0;
      studentsDataForSubmission[indexOfLowestGradeStudent].gradeFee = 0;
      studentsDataForSubmission[indexOfLowestGradeStudent].totalFee = studentsDataForSubmission[indexOfLowestGradeStudent].transportFee;
    }
  }

  // Map the temporary data to the final 'students' array for the payload, ensuring 'totalFee' reflects discounts
  students = studentsDataForSubmission.map(student => ({
      studentCode: student.studentCode,
      name: student.name,
      age: student.age,
      grade: student.grade,
      sex: student.sex,
      transport: student.transport,
      totalFee: student.totalFee // This will be the final calculated total including any discounts
  }));

  // Construct the full payload for submission
  const payload = {
    familyAccount: currentFamilyAccount,
    date: new Date().toLocaleDateString(),
    guardians,
    students, // This now contains the students with final calculated fees
    paymentMethod: document.getElementById("paymentMethod").value,
    transactionId: document.getElementById("transactionId").value
  };

  // Basic validation: ensure a transaction ID is entered
  if (!payload.transactionId) {
    alert("Please enter a transaction number before submitting.");
    return;
  }

  // Send the data to your Google Apps Script web app
  // IMPORTANT: Ensure the Google Apps Script at this URL is correctly deployed
  // to handle POST requests and return JSON as outlined in previous instructions.
  fetch("https://script.google.com/macros/s/AKfycbyf4nv-88N8j6ArJmzKdyxm0E9xFQ4Qz4vmAfEHrXUZatdubjtM3gh8kfcPH18V0Lbbig/exec", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => {
    // Custom error handling for non-JSON responses from the Apps Script
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return res.json(); // If JSON, parse it
    } else {
      // If not JSON, read as text and throw a more informative error
      return res.text().then(text => {
        throw new Error(`Expected JSON, but received HTML or plain text. Response starts with: "${text.substring(0, 100)}..."`);
      });
    }
  })
  .then(data => {
    // Handle success or failure based on the JSON response from Apps Script
    if (data.success) {
      alert("Registration Successful!");
      window.location.reload(); // Reload the page to clear the form for new registration
    } else {
      alert("Registration failed: " + (data.message || "Unknown error."));
    }
  })
  .catch(err => {
    // Catch network errors or errors thrown by our custom response handler
    alert("Error submitting registration: " + err.message + ". Please check your internet connection or the script URL/deployment.");
    console.error("Submission Error:", err);
  });
}
