from extensions import db


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    applicant_name = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="Pending")
    location = db.Column(db.String(120), nullable=False)
    plot_size = db.Column(db.String(80), nullable=False)

    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "applicantName": self.applicant_name,
            "status": self.status,
            "location": self.location,
            "plotSize": self.plot_size,
            "latitude": self.latitude,
            "longitude": self.longitude,
        }