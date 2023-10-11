export type UserState = {
	balance: number;
	redeem: RedeemState;
}

export type RedeemState = {
	hourly: Date;
	daily: Date;
	weekly: Date;
	monthly: Date;
}
