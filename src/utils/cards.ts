type CardSuit = 'S' | 'C' | 'D' | 'H';
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | 'J' | 'Q' | 'K';
export type CardID = `${CardValue}${CardSuit}`;

export function getCardImageURL(card: CardID) {
	return `/api/card/img/${card}`;
}

export type Card = {
	id: CardID;
	value: CardValue;
	suit: CardSuit;
	image: string;
};

export function getCard(card: CardID): Card {
	const value = card[0] as CardValue;
	const suit = card[1] as CardSuit;
	return {
		id: card,
		value,
		suit,
		image: getCardImageURL(card),
	};
}

export const possibleCards = [
	'AS',
	'2S',
	'3S',
	'4S',
	'5S',
	'6S',
	'7S',
	'8S',
	'9S',
	'0S',
	'JS',
	'QS',
	'KS',
	'AC',
	'2C',
	'3C',
	'4C',
	'5C',
	'6C',
	'7C',
	'8C',
	'9C',
	'0C',
	'JC',
	'QC',
	'KC',
	'AD',
	'2D',
	'3D',
	'4D',
	'5D',
	'6D',
	'7D',
	'8D',
	'9D',
	'0D',
	'JD',
	'QD',
	'KD',
	'AH',
	'2H',
	'3H',
	'4H',
	'5H',
	'6H',
	'7H',
	'8H',
	'9H',
	'0H',
	'JH',
	'QH',
	'KH',
];
