//components/ShowsCalendar.tsx
const ShowsCalendar = () => {
  return (
    <section id="calendrier-spectacles" className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8">Calendrier des spectacles</h2>
        
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-white font-bold">Mai 2025</h3>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition duration-300">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition duration-300">
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            <div className="text-center text-gray-500 text-sm">Lun</div>
            <div className="text-center text-gray-500 text-sm">Mar</div>
            <div className="text-center text-gray-500 text-sm">Mer</div>
            <div className="text-center text-gray-500 text-sm">Jeu</div>
            <div className="text-center text-gray-500 text-sm">Ven</div>
            <div className="text-center text-gray-500 text-sm">Sam</div>
            <div className="text-center text-gray-500 text-sm">Dim</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            <div className="text-center text-gray-600 p-2">29</div>
            <div className="text-center text-gray-600 p-2">30</div>
            <div className="text-center text-white p-2">1</div>
            <div className="text-center text-white p-2">2</div>
            <div className="text-center text-white p-2">3</div>
            <div className="text-center text-white p-2">4</div>
            <div className="text-center text-white p-2">5</div>
            
            <div className="text-center text-white p-2">6</div>
            <div className="text-center text-white p-2">7</div>
            <div className="text-center text-white p-2">8</div>
            <div className="text-center text-white p-2">9</div>
            <div className="text-center text-white p-2 relative group">
              <div className="bg-yellow-400 text-black rounded-full h-8 w-8 flex items-center justify-center mx-auto cursor-pointer">10</div>
              <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap">
                Marie Dubois - 20h30
              </div>
            </div>
            <div className="text-center text-white p-2">11</div>
            <div className="text-center text-white p-2">12</div>
            
            <div className="text-center text-white p-2">13</div>
            <div className="text-center text-white p-2">14</div>
            <div className="text-center text-white p-2 relative group">
              <div className="bg-yellow-400 text-black rounded-full h-8 w-8 flex items-center justify-center mx-auto cursor-pointer">15</div>
              <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap">
                Les Improvisateurs - 19h00
              </div>
            </div>
            <div className="text-center text-white p-2">16</div>
            <div className="text-center text-white p-2">17</div>
            <div className="text-center text-white p-2">18</div>
            <div className="text-center text-white p-2">19</div>
            
            <div className="text-center text-white p-2">20</div>
            <div className="text-center text-white p-2">21</div>
            <div className="text-center text-white p-2 relative group">
              <div className="bg-yellow-400 text-black rounded-full h-8 w-8 flex items-center justify-center mx-auto cursor-pointer">22</div>
              <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap">
                Thomas Laurent - 21h00
              </div>
            </div>
            <div className="text-center text-white p-2">23</div>
            <div className="text-center text-white p-2">24</div>
            <div className="text-center text-white p-2">25</div>
            <div className="text-center text-white p-2">26</div>
            
            <div className="text-center text-white p-2">27</div>
            <div className="text-center text-white p-2">28</div>
            <div className="text-center text-white p-2">29</div>
            <div className="text-center text-white p-2 relative group">
              <div className="bg-yellow-400 text-black rounded-full h-8 w-8 flex items-center justify-center mx-auto cursor-pointer">30</div>
              <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-2 rounded whitespace-nowrap">
                Julie Moreau - 20h00
              </div>
            </div>
            <div className="text-center text-white p-2">31</div>
            <div className="text-center text-gray-600 p-2">1</div>
            <div className="text-center text-gray-600 p-2">2</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowsCalendar;
