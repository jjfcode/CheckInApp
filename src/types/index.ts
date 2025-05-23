export interface Attendee {
    id: string;
    fullName: string;
    companyName: string;
    email: string;
    phoneNumber: string;
    interestedInFutureClasses: boolean;
    timestamp: string;
    className: string;
}

export interface Class {
    id: string;
    name: string;
    date: string;
    attendees: Attendee[];
}
