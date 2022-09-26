## add custom SQL we need to run here
CREATE TABLE email_inbox_map (
    id int NOT NULL AUTO_INCREMENT,
    message_id varchar(100) NOT NULL,
    thread_id varchar(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY message_id (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

## Table to store the email message detail
CREATE TABLE "email_message_detail" (
  "id" int NOT NULL AUTO_INCREMENT,
  "thread_id" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "label_ids" varchar(255) NULL,
  "user_id" varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  "message_from" blob NOT NULL,
  "message_to" blob NOT NULL,
  "message_subject" blob,
  "message" blob,
  "message_thread_id" varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  "received" datetime NOT NULL,
  "size_estimate" bigint DEFAULT NULL,
  "history_id" varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
