import React from 'react';
import QuotationTableItem from './QuotationTableItem';

interface QuotationItem {
	courseId: number | string;
	name: string;
	price: number;
	users: number;
}

interface QuotationTableProps {
	quotationItems: QuotationItem[];
	handleUpdateItemUsers: (index: number, newUsersValue: string) => void;
	handleRemoveItem: (index: number) => void;
}

export default function QuotationTable({
	quotationItems,
	handleUpdateItemUsers,
	handleRemoveItem,
}: 	QuotationTableProps) {
	if (quotationItems.length === 0) {
		return <p>Aún no has añadido cursos a la cotización.</p>;
	}

  return (
    <table className="table">
		<thead>
			<tr className='tableHeader'>
			<th className='--item'>Cursos ({quotationItems.length})</th>
			<th className='--item'>Cantidad</th>
			<th className='--item'>Precio de lista</th>
			<th className='--item'>Subtotal</th>
			<th className='--item' style={{ textAlign: 'center' }}>Eliminar</th>
			</tr>
		</thead>
		<tbody>
			{quotationItems.map((item, index) => (
			<QuotationTableItem
				key={item.courseId + '-' + index}
				item={item}
				index={index}
				handleUpdateItemUsers={handleUpdateItemUsers}
				handleRemoveItem={handleRemoveItem}
			/>
			))}
		</tbody>
    </table>
  );
}