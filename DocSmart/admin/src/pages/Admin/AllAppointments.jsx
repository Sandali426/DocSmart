import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const pdfRef = useRef()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredAppointments, setFilteredAppointments] = useState([])

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  useEffect(() => {
    setFilteredAppointments(appointments)
  }, [appointments])

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    
    if (!term) {
      setFilteredAppointments(appointments)
      return
    }

    const filtered = appointments.filter(appointment => {
      const patientName = appointment.userData.name.toLowerCase()
      const patientAge = calculateAge(appointment.userData.dob).toString()
      let status = ''
      
      if (appointment.cancelled) status = 'cancelled'
      else if (appointment.isCompleted) status = 'completed'
      else status = 'upcoming'

      return (
        patientName.includes(term) ||
        patientAge.includes(term) ||
        status.includes(term)
      )
    })

    setFilteredAppointments(filtered)
  }

  const downloadPDF = async () => {
    const input = pdfRef.current
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('appointments_report.pdf')
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3'>
        <p className='text-lg font-medium'>All Appointments</p>
        
        <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
          <div className='relative w-full sm:w-64'>
            <input
              type='text'
              placeholder='Search by name, age or status...'
              className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={handleSearch}
            />
            
          </div>
          
          <button 
            onClick={downloadPDF}
            className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center justify-center gap-2'
          >
            
            Download PDF
          </button>
        </div>
      </div>

      {filteredAppointments.length === 0 && searchTerm ? (
        <div className='bg-white border rounded p-4 text-center'>
          <p>No appointments found matching your search criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('')
              setFilteredAppointments(appointments)
            }}
            className='text-blue-500 mt-2 hover:underline'
          >
            Clear search
          </button>
        </div>
      ) : (
        <div ref={pdfRef} className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
          <div className='p-4 border-b'>
            <h2 className='text-xl font-bold text-center'>Appointments Report</h2>
            <p className='text-center text-gray-500 text-sm'>
              Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              {searchTerm && (
                <span className='block mt-1'>Showing results for: "{searchTerm}"</span>
              )}
            </p>
          </div>
          
          <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>
            <p>#</p>
            <p>Patient</p>
            <p>Age</p>
            <p>Date & Time</p>
            <p>Doctor</p>
            <p>Fees</p>
            <p>Status</p>
          </div>
          
          {filteredAppointments.map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
              <p className='max-sm:hidden'>{index+1}</p>
              <div className='flex items-center gap-2'>
                <img src={item.userData.image} className='w-8 rounded-full' alt="" /> 
                <p>{item.userData.name}</p>
              </div>
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
              <div className='flex items-center gap-2'>
                <img src={item.docData.image} className='w-8 rounded-full bg-gray-200' alt="" /> 
                <p>{item.docData.name}</p>
              </div>
              <p>{currency}{item.amount}</p>
              {item.cancelled ? (
                <p className='text-red-400 text-xs font-medium'>Cancelled</p>
              ) : item.isCompleted ? (
                <p className='text-green-500 text-xs font-medium'>Completed</p>
              ) : (
                <p className='text-blue-500 text-xs font-medium'>Upcoming</p>
              )}
            </div>
          ))}
          
          <div className='p-4 border-t text-right'>
            <p className='font-medium'>Showing {filteredAppointments.length} of {appointments.length} appointments</p>
            <p className='font-medium'>
              Total Revenue: {currency}
              {filteredAppointments.reduce((total, item) => !item.cancelled ? total + item.amount : total, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllAppointments