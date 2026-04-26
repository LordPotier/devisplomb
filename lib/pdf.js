import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateDevisPDF(devis) {
  const doc = new jsPDF()

  // En-tête
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('DEVIS', 14, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${devis.numero}`, 14, 28)
  doc.text(`Date : ${new Date(devis.created_at).toLocaleDateString('fr-FR')}`, 14, 34)
  doc.text(`Validité : 30 jours`, 14, 40)

  // Artisan
  doc.setFont('helvetica', 'bold')
  doc.text('Votre Plomberie Pro', 130, 20)
  doc.setFont('helvetica', 'normal')
  doc.text('SIRET : 123 456 789 00012', 130, 26)
  doc.text('Tel : 06 00 00 00 00', 130, 32)
  doc.text('contact@devisplomb.fr', 130, 38)

  // Client
  doc.setFillColor(245, 245, 245)
  doc.rect(14, 50, 180, 28, 'F')
  doc.setFont('helvetica', 'bold')
  doc.text('Client', 18, 58)
  doc.setFont('helvetica', 'normal')
  doc.text(devis.client_nom, 18, 65)
  doc.text(devis.client_adresse || '', 18, 71)

  // Description chantier
  if (devis.description) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.text(`Chantier : ${devis.description}`, 14, 86)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
  }

  // Tableau prestations
  const lignes = devis.lignes.map(l => [l.nom, '1', `${l.prix} €`, `${l.prix} €`])
  autoTable(doc, {
    startY: 92,
    head: [['Prestation', 'Qté', 'Prix HT', 'Total HT']],
    body: lignes,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [30, 30, 30] },
  })

  const finalY = doc.lastAutoTable.finalY + 10
  const ht = devis.lignes.reduce((a, l) => a + l.prix, 0)
  const tva = Math.round(ht * 0.1)
  const ttc = ht + tva

  doc.setFont('helvetica', 'normal')
  doc.text(`Total HT : ${ht} €`, 140, finalY)
  doc.text(`TVA 10% : ${tva} €`, 140, finalY + 6)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total TTC : ${ttc} €`, 140, finalY + 14)

  // Pied de page
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text('Devis valable 30 jours. TVA 10% applicable aux travaux de rénovation.', 14, 280)
  doc.text('Paiement à réception de facture. En cas de litige : tribunal de commerce compétent.', 14, 285)

  doc.save(`${devis.numero}.pdf`)
}
