CREATE TABLE `finance_records` (
	`owner` text NOT NULL,
	`collection` text NOT NULL,
	`id` text NOT NULL,
	`body` text NOT NULL,
	PRIMARY KEY(`owner`, `collection`, `id`)
);
