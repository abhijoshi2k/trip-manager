let registrationHTML = `
  <p>
    Hi,
    <br>
    Thank you for registering for Akkalkot trip!
  </p>
  <p>
    Name: <b>{{name}}</b>
    <br>
    Email: <b>{{passEmail}}</b>
    <br>
    Registration status: <b>{{status}}</b>
    <br>
    Registration ID: <b>{{uuid}}</b>
    <br>
    (Please note down your registration ID for future reference)
  </p>
  <p>
    <a href="{{viewLink}}">Click here</a> to view current status of registrations
  </p>
  <p>
    Copy below link if above does not work
    <br>
    <code>{{viewLink}}</code>
  </p>
  <p>Please do not reply to this mail</p>
  <p>
    Regards,
    <br>
    Akkalkot trip team
  </p>
`;
