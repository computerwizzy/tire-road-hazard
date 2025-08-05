
'use client';
import { format } from 'date-fns';

export function Invoice({ data }: { data: any }) {
  const { formData, policyNumber } = data;
  const items = [
    { mfg: '13757', title: `[Part] ${formData.tireSize} - ${formData.tireBrand} ${formData.tireModel}`, qty: 4, unit: 263.16, fet: 0, total: 1052.64 },
    { mfg: 'TMB', title: '[Labor] Tire Mount Base', qty: 4, unit: 20.00, fet: 0, total: 80.00 },
    { mfg: 'TBB', title: '[Labor] Tire Balance Base', qty: 4, unit: 10.00, fet: 0, total: 40.00 },
    { mfg: 'RHW', title: '[Labor] ROAD HAZARD', qty: 1, unit: 27.00, fet: 0, total: 27.00 },
    { mfg: 'DISCOUNT', title: '[Labor] DISCOUNT', qty: 1, unit: -107.64, fet: 0, total: -107.64 },
  ];
  const partsTotal = 1052.64;
  const laborTotal = 39.36;
  const taxes = 0.00;
  const total = partsTotal + laborTotal + taxes;

  return (
    <div className="bg-white p-8 printable-area">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hidden {
            display: none;
          }
        }
      `}</style>
      <header className="flex justify-between items-start mb-8">
        <div className="flex items-center">
          <img data-ai-hint="tire shop logo" src="https://placehold.co/100x50.png" alt="Logo" className="h-12 mr-4" />
          <div>
            <h1 className="text-2xl font-bold">TIRES AND ENGINE PERFORMANCE</h1>
            <p>3031 Pelham Parkway</p>
            <p>Pelham, 35124</p>
            <p>(205) 620-3311</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold">INVOICE</h2>
          <p className="font-bold text-lg">#{policyNumber.replace('WP-', 'A-')}</p>
          <p>WORK ORDER: #{Math.floor(Math.random() * 1000) + 9000}</p>
          <p>CREATED DATE: {format(formData.purchaseDate, 'MM/dd/yyyy hh:mm:ss a')}</p>
          <p>STATUS: PAID</p>
        </div>
      </header>
      
      <section className="flex justify-between mb-8">
        <div>
          <h3 className="font-bold text-gray-500">BILL TO</h3>
          <p>{formData.customerName}</p>
          <p>{formData.customerPhone}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-500">VEHICLE</h3>
          <p>{formData.vehicleYear} {formData.vehicleMake} {formData.vehicleModel} {formData.vehicleSubmodel}</p>
        </div>
        <div className="text-right">
            <h3 className="font-bold text-gray-500">Mileage In / Out</h3>
            <p>{formData.vehicleMileage} Mi. / {formData.vehicleMileage} Mi.</p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="font-bold bg-black text-white p-2 rounded-t-md">ITEMS</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">NO.</th>
              <th className="p-2 text-left">MFG #</th>
              <th className="p-2 text-left w-1/2">TITLE</th>
              <th className="p-2 text-right">QTY</th>
              <th className="p-2 text-right">UNIT</th>
              <th className="p-2 text-right">FET</th>
              <th className="p-2 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{item.mfg}</td>
                <td className="p-2">{item.title}</td>
                <td className="p-2 text-right">{item.qty}</td>
                <td className="p-2 text-right">${item.unit.toFixed(2)}</td>
                <td className="p-2 text-right">${item.fet.toFixed(2)}</td>
                <td className="p-2 text-right">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      <div className="flex justify-between">
        <div className="w-2/3 pr-4">
            <h3 className="font-bold mb-2">NOTES</h3>
            <p className="text-sm">KAFENE Phone# (855) 206-4040</p>
            <p className="text-sm">Lease ID# - LSE-J9GQU</p>
            <p className="text-sm">Amount Use ${total.toFixed(2)}</p>
            <p className="text-sm">
                I understand that the full amount being financed needs to be paid before 90
                TO 120 days to avoid any interest charges. Please call the finance company
                within three days to arrange your payments and change to the 90 TO 120
                days plan
            </p>
            <div className="mt-4">
                <p className="font-bold">DOT 1# {formData.tireDot}</p>
                <p className="font-bold">DOT 2# {formData.tireDot}</p>
                <p className="font-bold">DOT 3# {formData.tireDot}</p>
                <p className="font-bold">DOT 4# {formData.tireDot}</p>
            </div>
        </div>
        <div className="w-1/3 text-right">
            <div className="flex justify-between mb-2">
                <span>Parts</span>
                <span>${partsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Labor</span>
                <span>${laborTotal.toFixed(2)}</span>
            </div>
             <div className="flex justify-between mb-4">
                <span>Taxes</span>
                <span>${taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
      </div>

       <section className="mt-8">
        <h3 className="font-bold bg-black text-white p-2 rounded-t-md">PAYMENT CONDITIONS</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">REF. #</th>
              <th className="p-2 text-right">AMOUNT</th>
              <th className="p-2 text-center">METHOD</th>
              <th className="p-2 text-right">DATE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">LSE-J9GQU</td>
              <td className="p-2 text-right">${total.toFixed(2)}</td>
              <td className="p-2 text-center">KAFENE</td>
              <td className="p-2 text-right">{format(formData.purchaseDate, 'MM/dd/yyyy')}</td>
            </tr>
          </tbody>
        </table>
      </section>
      
      <footer className="mt-16 pt-8 border-t">
        <div className="flex justify-between items-end">
            <div>
                 <p>Created By: Antonio González | Sales Person: Antonio González</p>
                 <p className="text-sm text-gray-500">Tires and Engine Performance Store</p>
            </div>
            <div className="text-right">
                 <div className="w-64 h-12 border-b-2 border-gray-400 mb-2"></div>
                 <p className="font-bold">{formData.customerName}</p>
                 <p>Customer Signature</p>
            </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8">
            <p>{format(new Date(), 'MM/dd/yyyy hh:mm:ss a')} #{policyNumber.replace('WP-', 'A-')} - Powered by Tirebase.io - Page 1</p>
        </div>
      </footer>
    </div>
  );
}
