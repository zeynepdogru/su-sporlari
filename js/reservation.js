document.addEventListener("DOMContentLoaded", function () {
  const reservationForm = document.getElementById("reservationForm");
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const branchSelect = document.getElementById("branch");

  // Sabit değişkenler
  const allowedHours = Array.from({ length: 10 }, (_, i) => `${i + 10}:00`);

  // Rezervasyonları MongoDB'ye kaydet ve tüm rezervasyonları getir
  async function saveAndGetReservations(formData) {
    try {
      const response = await fetch(
        "https://su-sporlari.vercel.app/api/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Rezervasyon kaydedilemedi");
      }

      const data = await response.json();
      return data.reservations;
    } catch (error) {
      console.error("Rezervasyon işlemi sırasında hata:", error);
      throw error;
    }
  }

  // Rezervasyon listesini HTML formatına çevir
  function formatReservationsList(reservations) {
    return `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Müşteri</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Tarih</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Saat</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Branş</th>
          </tr>
        </thead>
        <tbody>
          ${reservations
            .map(
              (reservation) => `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px;">${reservation.name}</td>
              <td style="padding: 12px;">${reservation.date}</td>
              <td style="padding: 12px;">${reservation.time}</td>
              <td style="padding: 12px;">${reservation.branch}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  // Tarih sınırlamalarını ayarla
  function setupDateConstraints() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 15);

    const toDateInputFormat = (d) => d.toISOString().split("T")[0];
    dateInput.min = toDateInputFormat(today);
    dateInput.max = toDateInputFormat(maxDate);
    dateInput.value = toDateInputFormat(today);
  }

  // Saat seçeneklerini güncelle
  function updateTimeOptions(selectedDateStr) {
    timeSelect.innerHTML =
      '<option value="" disabled selected>Saat seçiniz..</option>';

    const now = new Date();
    const selectedDate = new Date(selectedDateStr + "T00:00");

    allowedHours.forEach((time) => {
      const [hour, minute] = time.split(":").map(Number);
      const timeDate = new Date(selectedDate);
      timeDate.setHours(hour, minute, 0, 0);

      if (
        selectedDate.toDateString() !== now.toDateString() || // farklı bir günse
        timeDate.getTime() > now.getTime() // bugün ama daha geçmemiş saat
      ) {
        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
      }
    });
  }

  // URL parametresinden branş seçimi
  function handleBranchSelection() {
    const params = new URLSearchParams(window.location.search);
    const selectedBranch = params.get("branş");
    if (selectedBranch && branchSelect) {
      branchSelect.value = selectedBranch;
    }
  }

  if (reservationForm) {
    reservationForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Form verilerini al
      const formData = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        people: document.getElementById("participants").value,
        notes: document.getElementById("message").value,
        branch: document.getElementById("branch").value,
      };

      // Form verilerini doğrula
      if (!formData.name) {
        alert("Ad Soyad alanı boş olamaz");
        return;
      }
      if (!formData.email) {
        alert("E-posta alanı boş olamaz");
        return;
      }
      if (!formData.phone) {
        alert("Telefon alanı boş olamaz");
        return;
      }
      if (!formData.branch) {
        alert("Branş seçimi yapılmadı");
        return;
      }
      if (!formData.date) {
        alert("Tarih seçimi yapılmadı");
        return;
      }
      if (!formData.time) {
        alert("Saat seçimi yapılmadı");
        return;
      }
      if (!formData.people || formData.people < 1) {
        alert("Geçerli bir katılımcı sayısı giriniz");
        return;
      }

      // Onay mesajını hemen göster
      if (successMessage) {
        const branchEmojis = {
          Kano: "🛶 Kano",
          Surf: "🌊 WindSurf",
          Sup: "🏄 SUP",
        };
        document.getElementById("successBranch").textContent =
          branchEmojis[formData.branch] || formData.branch;
        document.getElementById("successDate").textContent = formData.date;
        document.getElementById("successTime").textContent = formData.time;
        const cardFloating = document.querySelector(".rez-card-floating");
        if (cardFloating) cardFloating.style.display = "none";
        successMessage.style.display = "block";
        if (errorMessage) {
          errorMessage.style.display = "none";
        }
      }

      // Sunucuya kaydetme ve e-posta işlemleri arka planda başlasın
      (async () => {
        try {
          const allReservations = await saveAndGetReservations(formData);
          await emailjs.send("service_vtwshmq", "template_8rxsicl", formData);
          const adminData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            branch: formData.branch,
            date: formData.date,
            time: formData.time,
            people: formData.people,
            notes: formData.notes || "Not belirtilmedi",
            reservations: formatReservationsList(allReservations),
          };
          await emailjs.send("service_vtwshmq", "template_ik4vh2r", adminData);
        } catch (error) {
          alert(
            "Rezervasyon kaydedilirken veya e-posta gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          );
        }
      })();
    });
  }

  // Event listeners
  dateInput.addEventListener("change", () =>
    updateTimeOptions(dateInput.value)
  );

  // Başlangıç ayarları
  setupDateConstraints();
  updateTimeOptions(dateInput.value);
  handleBranchSelection();
});
