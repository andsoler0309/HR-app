import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function convertToPDF(htmlContent: string, fileName: string): Promise<void> {
  // Create temporary container
  const container = document.createElement('div')
  container.innerHTML = htmlContent
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false
    })

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(fileName)
  } finally {
    document.body.removeChild(container)
  }
}