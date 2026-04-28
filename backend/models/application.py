from extensions import db


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)

    # Applicant details
    applicant_name = db.Column(db.String(120), nullable=False)
    father_name = db.Column(db.String(120), nullable=True)
    mobile = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)

    # Plot / location details
    status = db.Column(db.String(30), nullable=False, default="Pending")
    location = db.Column(db.String(120), nullable=False)
    address = db.Column(db.Text, nullable=True)
    survey_no = db.Column(db.String(80), nullable=True)
    plot_size = db.Column(db.String(80), nullable=False)
    plot_area = db.Column(db.String(80), nullable=True)

    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    # Building details
    building_type = db.Column(db.String(80), nullable=True)
    floors = db.Column(db.String(30), nullable=True)
    height = db.Column(db.String(30), nullable=True)

    # Review / officer details
    remarks = db.Column(db.Text, nullable=True)

    # Uploaded file details
    file_name = db.Column(db.String(255), nullable=True)
    file_url = db.Column(db.String(500), nullable=True)
    uploaded_file = db.Column(db.String(500), nullable=True)

    road_width = db.Column(db.String(50), nullable=True)
    land_type = db.Column(db.String(80), nullable=True)
    builtup_area = db.Column(db.String(80), nullable=True)
    front_setback = db.Column(db.String(50), nullable=True)
    side_setback = db.Column(db.String(50), nullable=True)
    rear_setback = db.Column(db.String(50), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,

            # Applicant details
            "applicantName": self.applicant_name,
            "name": self.applicant_name,
            "fatherName": self.father_name,
            "mobile": self.mobile,
            "email": self.email,

            # Plot / location details
            "status": self.status,
            "location": self.location,
            "address": self.address,
            "surveyNo": self.survey_no,
            "plotSize": self.plot_size,
            "plotArea": self.plot_area,

            "latitude": self.latitude,
            "longitude": self.longitude,

            # Building details
            "buildingType": self.building_type,
            "floors": self.floors,
            "height": self.height,

            # Review / officer details
            "remarks": self.remarks,

            # File details
            "fileName": self.file_name,
            "fileUrl": self.file_url,
            "uploadedFile": self.uploaded_file,

            "roadWidth": self.road_width,
            "landType": self.land_type,
            "builtupArea": self.builtup_area,
            "frontSetback": self.front_setback,
            "sideSetback": self.side_setback,
            "rearSetback": self.rear_setback,
        }