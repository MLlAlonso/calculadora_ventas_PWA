import React from 'react';

interface QuotationTableItemProps {
  item: {
    courseId: number | string;
    name: string;
    price: number;
    users: number;
  };
  index: number;
  handleUpdateItemUsers: (index: number, newUsersValue: string) => void;
  handleRemoveItem: (index: number) => void;
}

export default function QuotationTableItem({
  item,
  index,
  handleUpdateItemUsers,
  handleRemoveItem,
}: QuotationTableItemProps) {
  return (
    <tr key={item.courseId + '-' + index} className='tableBody'>

        {/*--NOMBRE DEL CURSO--*/}
        <td
        className='--item'
        style={{ width: '100%', minWidth: '240px' }}>
            {item.name}
        </td>

        {/*--CANTIDAD--*/}
        <td
        className='--item'
        style={{ minWidth: '120px' }}>
            <input
            type="number"
            value={item.users}
            onChange={(e) => handleUpdateItemUsers(index, e.target.value)}
            min="1"
            style={{ width: '70px' }}
            />
        </td>

        {/*--PRECIO DE LISTA--*/}
        <td
        className='--item'
        style={{ minWidth: '136px' }}>
            ${item.price.toFixed(2)}
        </td>

        {/*--SUBTOTAL--*/}
        <td
        className='--item'
        style={{ minWidth: '136px' }}>
            ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(item.price * item.users)}
        </td>

        {/*--ELIMINAR--*/}
        <td
        className='--item'
        style={{ minWidth: '100px', textAlign: 'center' }}>
            <button
            onClick={() => handleRemoveItem(index)}
            className="icon-button"
            >
            <img src="/icons/icon__trash.svg" alt="" />
            </button>
        </td>
    </tr>
  );
}