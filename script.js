 
      // Background Particles
      function createParticles() {
        const particles = document.getElementById('particles');
        const particleCount = 50;
        
        for(let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          const size = Math.random() * 5 + 2;
          const left = Math.random() * 100;
          const duration = Math.random() * 10 + 10;
          
          particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            animation-duration: ${duration}s;
            animation-delay: ${Math.random() * 10}s;
          `;
          
          particles.appendChild(particle);
        }
      }
      createParticles();

      // Seat Booking Logic
      const container = document.querySelector('.container');
      const seats = document.querySelectorAll('.row .seat:not(.occupied)');
      const count = document.getElementById('count');
      const total = document.getElementById('total');
      const movieSelect = document.getElementById('movie');

      let ticketPrice = +movieSelect.value;

      function setMovieData(movieIndex, moviePrice) {
        localStorage.setItem('selectedMovieIndex', movieIndex);
        localStorage.setItem('selectedMoviePrice', moviePrice);
      }

      function updateSelectedCount() {
        const selectedSeats = document.querySelectorAll('.row .seat.selected');
        const seatsIndex = [...selectedSeats].map(seat => [...seats].indexOf(seat));
        localStorage.setItem('selectedSeats', JSON.stringify(seatsIndex));
        
        const selectedSeatsCount = selectedSeats.length;
        count.innerText = selectedSeatsCount;
        total.innerText = selectedSeatsCount * ticketPrice;
        setMovieData(movieSelect.selectedIndex, movieSelect.value);
      }

      function populateUI() {
        const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
        if (selectedSeats !== null && selectedSeats.length > 0) {
          seats.forEach((seat, index) => {
            if (selectedSeats.indexOf(index) > -1) {
              seat.classList.add('selected');
            }
          });
        }

        const selectedMovieIndex = localStorage.getItem('selectedMovieIndex');
        if (selectedMovieIndex !== null) {
          movieSelect.selectedIndex = selectedMovieIndex;
        }
      }

      // PDF Ticket Generation
      function generateTicketPDF(movie, seats, total) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFillColor(10, 8, 31);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text('CINEMA TICKET', 105, 30, { align: 'center' });

        doc.setFontSize(14);
        doc.text(`Movie: ${movie}`, 20, 60);
        doc.text(`Seats: ${seats}`, 20, 75);
        doc.text(`Total: $${total}`, 20, 90);
        doc.text(`Booking ID: #${Math.floor(Math.random() * 1000000)}`, 20, 105);
        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 120);

        doc.setDrawColor(255, 255, 255);
        doc.rect(130, 60, 60, 60);
        doc.text('QR CODE', 160, 95, { align: 'center' });

        doc.save(`MovieTicket_${Date.now()}.pdf`);
      }

      // Event Listeners
      movieSelect.addEventListener('change', e => {
        ticketPrice = +e.target.value;
        setMovieData(e.target.selectedIndex, e.target.value);
        updateSelectedCount();
      });

      container.addEventListener('click', e => {
        if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
          e.target.classList.toggle('selected');
          updateSelectedCount();
        }
      });

      document.querySelector('.confirm-btn').addEventListener('click', () => {
        const selectedCount = document.querySelectorAll('.selected').length;
        if (selectedCount === 0) {
          const toast = document.createElement('div');
          toast.className = 'notification';
          toast.textContent = 'Please select at least one seat!';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
          return;
        }
        
        const movie = document.getElementById('movie').selectedOptions[0].text;
        generateTicketPDF(
          movie,
          selectedCount,
          document.getElementById('total').textContent
        );

        document.querySelectorAll('.selected').forEach(seat => {
          seat.classList.remove('selected');
          seat.classList.add('occupied');
        });
        updateSelectedCount();
      });

      // Initialize
      populateUI();
      updateSelectedCount();