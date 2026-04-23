CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobConfigurationId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientCNPJ` varchar(20),
	`clientAddress` text,
	`quantity` int NOT NULL DEFAULT 1,
	`budgetData` json NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`shareLink` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `budgets_shareLink_unique` UNIQUE(`shareLink`)
);
--> statement-breakpoint
CREATE TABLE `job_configurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobName` varchar(255) NOT NULL,
	`jobType` varchar(100) NOT NULL,
	`journeyType` varchar(50) NOT NULL,
	`baseSalary` decimal(10,2) NOT NULL,
	`socialChargesPercentage` decimal(5,2) NOT NULL DEFAULT '81',
	`adminFeePercentage` decimal(5,2) NOT NULL DEFAULT '5',
	`taxPercentage` decimal(5,2) NOT NULL DEFAULT '20.44',
	`lifeInsurance` decimal(10,2) NOT NULL DEFAULT '9.77',
	`paf` decimal(10,2) NOT NULL DEFAULT '103.09',
	`basicBasket` decimal(10,2) NOT NULL DEFAULT '200.00',
	`uniforms` decimal(10,2) NOT NULL DEFAULT '75.00',
	`transportValue` decimal(10,2) NOT NULL DEFAULT '26.00',
	`foodValue` decimal(10,2) NOT NULL DEFAULT '31.34',
	`transportCoparticipationPercentage` decimal(5,2) NOT NULL DEFAULT '6',
	`foodCoparticipationPercentage` decimal(5,2) NOT NULL DEFAULT '20',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_configurations_id` PRIMARY KEY(`id`)
);
