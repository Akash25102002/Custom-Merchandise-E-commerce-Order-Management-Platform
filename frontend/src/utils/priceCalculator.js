/**
 * Calculate customized product item price dynamically.
 * 
 * @param {Object} params
 * @param {number} params.basePrice - Product base price
 * @param {string} [params.size='M'] - Garment size (XS, S, M, L, XL, 2XL, 3XL)
 * @param {string} [params.printArea='front'] - 'front' | 'back' | 'both'
 * @param {string} [params.customText=''] - Custom printed text
 * @param {string} [params.logoUrl=null] - Custom uploaded logo image URL
 * @param {number} [params.quantity=1] - Item quantity
 * @returns {Object} breakdown - Detailed calculation breakdown and final unit/total price
 */
export const calculateCustomizedPrice = ({
  basePrice = 0,
  size = 'M',
  printArea = 'front',
  customText = '',
  logoUrl = null,
  quantity = 1,
}) => {
  const numericBase = Number(basePrice) || 0;

  // Size surcharges for larger sizes (2XL, 3XL)
  let sizeAddon = 0;
  if (size === '2XL') sizeAddon = 3.0;
  if (size === '3XL') sizeAddon = 5.0;

  // Print area pricing
  let printAreaAddon = 0;
  if (printArea === 'both') {
    printAreaAddon = 6.0;
  } else if (printArea === 'back') {
    printAreaAddon = 2.0;
  }

  // Text customization surcharge
  const textAddon = customText.trim().length > 0 ? 3.0 : 0;

  // Custom logo upload surcharge
  const logoAddon = logoUrl ? 5.0 : 0;

  const unitPrice = numericBase + sizeAddon + printAreaAddon + textAddon + logoAddon;
  const totalPrice = unitPrice * Math.max(1, quantity);

  return {
    basePrice: numericBase,
    sizeAddon,
    printAreaAddon,
    textAddon,
    logoAddon,
    unitPrice: Number(unitPrice.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2)),
  };
};
