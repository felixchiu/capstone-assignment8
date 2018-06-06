class Thing < ActiveRecord::Base
  include Protectable
  validates :name, :presence=>true
  belongs_to :type
  has_many :thing_images, inverse_of: :thing, dependent: :destroy

  scope :not_linked, ->(image) { where.not(:id=>ThingImage.select(:thing_id)
                                                          .where(:image=>image)) }
  scope :by_type, ->(typeid) { where(:type_id=>typeid)}
end
